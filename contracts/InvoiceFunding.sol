// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InvoiceFunding {

    enum Status { Open, Funded, Released, Repaid, Refunded }

    struct Invoice {
        uint256 id;
        address payable seller;
        address payable investor;
        uint256 amount;
        uint256 repayAmount;
        string  description;
        string  ipfsHash;
        string  sellerName;
        string  buyerName;
        uint256 repayDays;
        Status  status;
        uint256 fundedAt;
    }

    uint256 public invoiceCount;
    uint256 public constant REFUND_WINDOW = 2 minutes; // change to 1 hours for production
    uint256 public constant FEE_PERCENT   = 5;

    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public sellerInvoices;
    mapping(address => uint256[]) public investorInvoices;

    // ── Events ───────────────────────────────────────────────────────────────

    event InvoiceCreated(uint256 indexed id, address indexed seller, uint256 amount, uint256 repayAmount);
    event InvoiceFunded(uint256 indexed id, address indexed investor, uint256 amount, uint256 timestamp);
    event FundsReleasedToSeller(uint256 indexed id, address indexed seller, uint256 amount);
    event InvoiceRepaid(uint256 indexed id, uint256 repayAmount);
    event InvoiceRefunded(uint256 indexed id, address indexed investor);

    // ── Modifier ─────────────────────────────────────────────────────────────

    modifier invoiceExists(uint256 id) {
        require(id > 0 && id <= invoiceCount, "Invoice does not exist");
        _;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    function calcRepayAmount(uint256 amount) public pure returns (uint256) {
        return amount + (amount * FEE_PERCENT / 100);
    }

    function _sendEth(address payable to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH transfer failed");
    }

    // ── Write Functions ───────────────────────────────────────────────────────

    function createInvoice(
        uint256         amount,
        string calldata description,
        string calldata ipfsHash,
        string calldata sellerName,
        string calldata buyerName,
        uint256         repayDays
    ) external returns (uint256) {
        require(amount > 0,                        "Amount must be > 0");
        require(bytes(description).length > 0,     "Description required");
        require(repayDays > 0 && repayDays <= 365, "Repay days must be 1-365");

        uint256 repayAmt = calcRepayAmount(amount);

        invoiceCount++;
        invoices[invoiceCount] = Invoice({
            id:          invoiceCount,
            seller:      payable(msg.sender),
            investor:    payable(address(0)),
            amount:      amount,
            repayAmount: repayAmt,
            description: description,
            ipfsHash:    ipfsHash,
            sellerName:  sellerName,
            buyerName:   buyerName,
            repayDays:   repayDays,
            status:      Status.Open,
            fundedAt:    0
        });
        sellerInvoices[msg.sender].push(invoiceCount);

        emit InvoiceCreated(invoiceCount, msg.sender, amount, repayAmt);
        return invoiceCount;
    }

    /// @notice Investor funds — ETH held in contract during refund window
    function fundInvoice(uint256 invoiceId)
        external payable invoiceExists(invoiceId)
    {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == Status.Open,   "Invoice not open");
        require(msg.sender != inv.seller,    "Seller cannot fund own invoice");
        require(msg.value == inv.amount,     "Send exact invoice amount");

        inv.investor = payable(msg.sender);
        inv.status   = Status.Funded;
        inv.fundedAt = block.timestamp;

        investorInvoices[msg.sender].push(invoiceId);
        emit InvoiceFunded(invoiceId, msg.sender, msg.value, block.timestamp);
    }

    /// @notice Seller collects funds after refund window closes
    function releaseFundsToSeller(uint256 invoiceId)
        external invoiceExists(invoiceId)
    {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == Status.Funded,                    "Invoice not funded");
        require(msg.sender == inv.seller,                       "Only seller can release");
        require(block.timestamp > inv.fundedAt + REFUND_WINDOW, "Refund window still open");

        // Save values before state change
        uint256 amt              = inv.amount;
        address payable seller   = inv.seller;

        // Update state first
        inv.status = Status.Released;
        // Keep inv.amount and inv.repayAmount intact — needed for repayment check

        emit FundsReleasedToSeller(invoiceId, seller, amt);

        // Send ETH to seller
        _sendEth(seller, amt);
    }

    /// @notice Investor requests refund within window — invoice resets to Open
    function requestRefund(uint256 invoiceId)
        external invoiceExists(invoiceId)
    {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == Status.Funded,                     "Invoice not funded");
        require(msg.sender == inv.investor,                      "Only investor can refund");
        require(block.timestamp <= inv.fundedAt + REFUND_WINDOW, "Refund window closed");

        uint256 amt                  = inv.amount;
        address payable prevInvestor = inv.investor;

        // Reset invoice back to Open
        inv.status   = Status.Open;
        inv.investor = payable(address(0));
        inv.fundedAt = 0;

        emit InvoiceRefunded(invoiceId, prevInvestor);
        _sendEth(prevInvestor, amt);
    }

    /// @notice Seller repays — investor gets principal + 5% profit
    function repayInvoice(uint256 invoiceId)
        external payable invoiceExists(invoiceId)
    {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == Status.Released,  "Must collect funds before repaying");
        require(msg.sender == inv.seller,       "Only seller can repay");
        require(msg.value == inv.repayAmount,   "Send exact repay amount");

        // Save investor address before state change
        address payable investor = inv.investor;
        uint256 total            = inv.repayAmount;

        // Update state
        inv.status = Status.Repaid;

        emit InvoiceRepaid(invoiceId, total);

        // Send full repayAmount to investor
        _sendEth(investor, total);
    }

    // ── View Functions ────────────────────────────────────────────────────────

    function getInvoiceMain(uint256 invoiceId)
        external view invoiceExists(invoiceId)
        returns (
            uint256 id,
            address seller,
            address investor,
            uint256 amount,
            uint256 repayAmount,
            uint8   status,
            uint256 fundedAt
        )
    {
        Invoice storage inv = invoices[invoiceId];
        return (
            inv.id,
            inv.seller,
            inv.investor,
            inv.amount,
            inv.repayAmount,
            uint8(inv.status),
            inv.fundedAt
        );
    }

    function getInvoiceMeta(uint256 invoiceId)
        external view invoiceExists(invoiceId)
        returns (
            string memory description,
            string memory ipfsHash,
            string memory sellerName,
            string memory buyerName,
            uint256 repayDays
        )
    {
        Invoice storage inv = invoices[invoiceId];
        return (
            inv.description,
            inv.ipfsHash,
            inv.sellerName,
            inv.buyerName,
            inv.repayDays
        );
    }

    function getInvoiceCount() external view returns (uint256) {
        return invoiceCount;
    }

    function getSellerInvoices(address seller)
        external view returns (uint256[] memory)
    {
        return sellerInvoices[seller];
    }

    function getInvestorInvoices(address investor)
        external view returns (uint256[] memory)
    {
        return investorInvoices[investor];
    }

    function isRefundable(uint256 invoiceId)
        external view invoiceExists(invoiceId)
        returns (bool)
    {
        Invoice storage inv = invoices[invoiceId];
        return inv.status == Status.Funded &&
               block.timestamp <= inv.fundedAt + REFUND_WINDOW;
    }

    function canRelease(uint256 invoiceId)
        external view invoiceExists(invoiceId)
        returns (bool)
    {
        Invoice storage inv = invoices[invoiceId];
        return inv.status == Status.Funded &&
               block.timestamp > inv.fundedAt + REFUND_WINDOW;
    }
}