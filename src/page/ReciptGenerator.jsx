import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  Trash2,
  Plus,
  Download,
  RotateCcw,
  HelpCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

export default function ReceiptGenerator() {
  // State for all form fields
  const [formData, setFormData] = useState({
    variant: "normal",
    theme: "Theme 18",
    restaurantName: "The Kaapi House",
    restaurantTagline: "Freshly brewed filter coffee & South Indian fare",
    customerName: "Karthik S",
    billDate: "2026-05-19",
    orderType: "Dine-In",
    billTime: "22:16",
    billNo: "184732",
    cashierName: "Anita",
    tokenNumber: "42",
    taxPercent: 5,
    currency: "INR",
    currencySymbol: "₹",
    comment: "Thank you for visiting. We hope to serve you again soon.",
    fileName: "Restaurant Bill Template 1",
    isTermsChecked: true
  });

  // Dynamic Items list state
  const [items, setItems] = useState([
    {
      id: 1,
      description: "Mysore Masala Dosa",
      price: 110,
      qty: 1,
      total: 110,
    },
    { id: 2, description: "Idli Sambar", price: 60, qty: 1, total: 60 },
    { id: 3, description: "Medu Vada", price: 45, qty: 2, total: 90 },
    { id: 4, description: "Filter Kaapi", price: 40, qty: 2, total: 80 },
    { id: 5, description: "Rava Kesari", price: 100, qty: 1, total: 100 },
  ]);

  const isFormValid =
    formData.restaurantName.trim() !== "" &&
    formData.customerName.trim() !== "" &&
    formData.orderType.trim() !== "" &&
    formData.fileName.trim() !== "" &&
    formData.isTermsChecked === true;

  const [paperSize, setPaperSize] = useState("thermal80");

  const receiptRef = useRef(null);

  // Currency definitions mapping
  const currencies = [
    { code: "INR", symbol: "₹", label: "₹ - Indian Rupee (INR)" },
    { code: "USD", symbol: "$", label: "$ - US Dollar (USD)" },
    { code: "EUR", symbol: "€", label: "€ - Euro (EUR)" },
    { code: "GBP", symbol: "£", label: "£ - Pound Sterling (GBP)" },
    { code: "JPY", symbol: "¥", label: "¥ - Japanese Yen (JPY)" },
    { code: "CNY", symbol: "¥", label: "¥ - Yuan Renminbi (CNY)" },
    { code: "AUD", symbol: "A$", label: "A$ - Australian Dollar (AUD)" },
    { code: "CAD", symbol: "C$", label: "C$ - Canadian Dollar (CAD)" },
    { code: "CHF", symbol: "CHF", label: "CHF - Swiss Franc (CHF)" },
    { code: "SGD", symbol: "S$", label: "S$ - Singapore Dollar (SGD)" },
    { code: "AED", symbol: "د.إ", label: "د.إ - UAE Dirham (AED)" },
    { code: "SAR", symbol: "ريال", label: "ريال - Saudi Riyal (SAR)" },
    { code: "QAR", symbol: "ريال", label: "ريال - Qatari Riyal (QAR)" },
    { code: "KWD", symbol: "د.ك", label: "د.ك - Kuwaiti Dinar (KWD)" },
    { code: "BHD", symbol: "د.ب", label: "د.ب - Bahraini Dinar (BHD)" },
    { code: "OMR", symbol: "ريال", label: "ريال - Omani Rial (OMR)" },
    { code: "RUB", symbol: "₽", label: "₽ - Russian Ruble (RUB)" },
    { code: "ZAR", symbol: "R", label: "R - South African Rand (ZAR)" },
    { code: "KRW", symbol: "₩", label: "₩ - South Korean Won (KRW)" },
    { code: "THB", symbol: "฿", label: "฿ - Thai Baht (THB)" },
    { code: "TRY", symbol: "₺", label: "₺ - Turkish Lira (TRY)" },
    { code: "MYR", symbol: "RM", label: "RM - Malaysian Ringgit (MYR)" },
    { code: "IDR", symbol: "Rp", label: "Rp - Indonesian Rupiah (IDR)" },
    { code: "PHP", symbol: "₱", label: "₱ - Philippine Peso (PHP)" },
    { code: "NZD", symbol: "NZ$", label: "NZ$ - New Zealand Dollar (NZD)" },
    { code: "BRL", symbol: "R$", label: "R$ - Brazilian Real (BRL)" },
  ];

  // Calculated properties
  const totalQty = items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0),
    0,
  );
  const subTotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0),
    0,
  );
  const taxAmount = (subTotal * (Number(formData.taxPercent) || 0)) / 100;
  const grandTotal = subTotal + taxAmount;

  // Handle simple input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Synchronize currency symbols when currency dropdown changes
  useEffect(() => {
    const selected = currencies.find((c) => c.code === formData.currency);
    if (selected) {
      setFormData((prev) => ({ ...prev, currencySymbol: selected.symbol }));
    }
  }, [formData.currency]);

  // Handle dynamic items structural mutations
  const handleItemChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "price" || field === "qty") {
            updatedItem.total =
              (Number(updatedItem.price) || 0) * (Number(updatedItem.qty) || 0);
          }
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const addItemRow = () => {
    const newId =
      items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    setItems([
      ...items,
      { id: newId, description: "", price: 0, qty: 0, total: 0 },
    ]);
  };

  const removeItemRow = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const generateRandomBillNo = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    setFormData((prev) => ({ ...prev, billNo: String(rand) }));
  };

  const generateRandomToken = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, tokenNumber: String(rand) }));
  };

  const resetForm = () => {
    setFormData({
      variant: "normal",
      theme: "Theme 18",
      restaurantName: "The Kaapi House",
      restaurantTagline: "Freshly brewed filter coffee & South Indian fare",
      customerName: "Karthik S",
      billDate: "2026-05-19",
      orderType: "Dine-In",
      billTime: "22:16",
      billNo: "184732",
      cashierName: "Anita",
      tokenNumber: "42",
      taxPercent: 5,
      currency: "INR",
      currencySymbol: "₹",
      comment: "Thank you for visiting. We hope to serve you again soon.",
      fileName: "Restaurant Bill Template 1",
    });
    setItems([
      {
        id: 1,
        description: "Mysore Masala Dosa",
        price: 110,
        qty: 1,
        total: 110,
      },
      { id: 2, description: "Idli Sambar", price: 60, qty: 1, total: 60 },
      { id: 3, description: "Medu Vada", price: 45, qty: 2, total: 90 },
      { id: 4, description: "Filter Kaapi", price: 40, qty: 2, total: 80 },
      { id: 5, description: "Rava Kesari", price: 100, qty: 1, total: 100 },
    ]);
  };

  //PDF Compilation & Download Engine Engine
  const downloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        // ✅ Capture only the exact receipt element size
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      const sizeMap = {
        thermal80: 80,
        a4: 210,
        a3: 297,
      };

      const pdfWidth = sizeMap[paperSize] || 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${formData.fileName || "receipt"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };
  // Date formatting parser helper
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.substring(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - INPUT CONTROLS                                              */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm font-lato">
          {/* Design Variant Field Group */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              Design Variant
            </legend>
            <div className="space-y-4 pt-1">
              <label className="block text-sm mb-1.75">Select Variant</label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 text-sm ">
                  <input
                    type="radio"
                    name="variant"
                    value="Normal"
                    checked={formData.variant === "Normal"}
                    onChange={handleInputChange}
                    className="text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Normal</span>
                </label>
                <label className="flex items-center space-x-2 text-sm ">
                  <input
                    type="radio"
                    name="variant"
                    value="Crumpled"
                    checked={formData.variant === "Crumpled"}
                    onChange={handleInputChange}
                    className="text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Crumpled</span>
                </label>
              </div>
              {formData.variant === "Crumpled" && (
                <div>
                  <label className="block text-sm mb-1.75">
                    Choose an additional background option: *
                  </label>
                  <div className="flex items-center space-x-2">
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="Theme 18">Theme 18</option>
                      <option value="Theme 19">Theme 19</option>
                    </select>
                    <button
                      type="button"
                      className="p-2 border rounded text-blue-500 hover:bg-gray-100"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </fieldset>

          {/* Restaurant Details Field Group */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              Restaurant Details
            </legend>
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-sm mb-1.75">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm mb-1.75">
                  Restaurant Tagline
                </label>
                <input
                  type="text"
                  name="restaurantTagline"
                  value={formData.restaurantTagline}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>
          </fieldset>

          {/* Customer & Bill Core Metadata Group */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              Customer Details
            </legend>
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-sm mb-1.75">Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1.75">Bill Date</label>
                  <input
                    type="date"
                    name="billDate"
                    value={formData.billDate}
                    onChange={handleInputChange}
                    className="form-control cursor-pointer"
                  />
                </div>
              </div>
              <div className="w-full">
                <div>
                  <div className="flex items-center space-x-1 mb-1.75">
                    <label className="text-sm">Order Type *</label>
                    <HelpCircle size={12} className="text-gray-400" />
                  </div>
                  <select
                    name="orderType"
                    value={formData.orderType}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="Dine-In">Dine-In</option>
                    <option value="Takeaway">Takeaway</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1.75">Bill Time</label>
                  <input
                    type="time"
                    name="billTime"
                    value={formData.billTime}
                    onChange={handleInputChange}
                    className="form-control cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.75">
                    <label className="text-sm">Bill No</label>
                    <HelpCircle size={12} className="text-gray-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      name="billNo"
                      value={formData.billNo}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                    <button
                      type="button"
                      onClick={generateRandomBillNo}
                      className="p-2 border rounded text-blue-500 hover:bg-gray-100"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1.75">Cashier Name</label>
                  <input
                    type="text"
                    name="cashierName"
                    value={formData.cashierName}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.75">
                    <label className="text-sm">Token Number</label>
                    <HelpCircle size={12} className="text-gray-400" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      name="tokenNumber"
                      value={formData.tokenNumber}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                    <button
                      type="button"
                      onClick={generateRandomToken}
                      className="p-2 border rounded text-blue-500 hover:bg-gray-100"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Line Items Transactional Layout Sub-Form */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative min-w-0">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              Item Details
            </legend>
            <div className="space-y-3 pt-2">
              <span className="text-sm block mb-1.75">Items</span>

              {/* ✅ min-w-0 here is the key — constrains the scroll container */}
              <div className=" overflow-x-auto">
                <table
                  className="divide-y divide-gray-200 border-gray-300"
                  style={{ tableLayout: "fixed", minWidth: "1260px" }}
                >
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="p-1 text-xs font-medium uppercase border border-gray-300 text-center"
                        style={{ width: "35%" }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>DESCRIPTION</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="p-1 text-xs font-medium uppercase border border-gray-300 text-center"
                        style={{ width: "20%" }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>ITEM PRICE</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="p-1 text-xs font-medium uppercase border border-gray-300 text-center"
                        style={{ width: "20%" }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>QUANTITY</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="p-1 text-xs font-medium uppercase border border-gray-300 text-center"
                        style={{ width: "25%" }}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>TOTAL</span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="border border-gray-300 text-center py-0.5"
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          maxWidth: "40px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={addItemRow}
                          className="inline-flex items-center justify-center w-7 h-7 p-0 border border-transparent 
                  rounded-md text-white transition-all duration-200 focus:outline-none focus:ring-2 
                  focus:ring-offset-1 focus:ring-indigo-500 active:scale-95 bg-indigo-600 hover:bg-indigo-700 hover:shadow-md"
                        >
                          <Plus size={14} className="text-sm leading-none" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-300">
                    {items.map((item) => (
                      <tr key={item.id} className="text-center">
                        <td
                          className="border p-1 whitespace-nowrap border-gray-300"
                          style={{ width: "35%" }}
                        >
                          <textarea
                            rows={1}
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="h-10 px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
                    sm:text-sm text-gray-900 bg-white border border-gray-300"
                            style={{
                              width: "100%",
                              resize: "vertical",
                              overflow: "auto",
                            }}
                          />
                        </td>
                        <td
                          className="border p-1 whitespace-nowrap border-gray-300"
                          style={{ width: "20%" }}
                        >
                          <input
                            step="any"
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(item.id, "price", e.target.value)
                            }
                            className="block px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
                    sm:text-sm text-gray-900 bg-white border border-gray-300"
                            style={{ width: "100%" }}
                          />
                        </td>
                        <td
                          className="border p-1 whitespace-nowrap border-gray-300"
                          style={{ width: "20%" }}
                        >
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              handleItemChange(item.id, "qty", e.target.value)
                            }
                            className="block px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 
                    sm:text-sm text-gray-900 bg-white border border-gray-300"
                            style={{ width: "100%" }}
                          />
                        </td>
                        <td
                          className="border p-1 whitespace-nowrap border-gray-300"
                          style={{ width: "25%" }}
                        >
                          {/* ✅ Fixed: calculate actual total instead of showing qty */}
                          <input
                            type="number"
                            readOnly
                            value={(
                              parseFloat(item.price) * parseFloat(item.qty) || 0
                            ).toFixed(2)}
                            className="font-semibold block w-full px-3 py-2 rounded-md shadow-sm bg-gray-100 
                    text-gray-700 border border-gray-300 sm:text-sm"
                          />
                        </td>
                        <td
                          className="whitespace-nowrap border px-0 text-center border-gray-300"
                          style={{
                            width: "40px",
                            minWidth: "40px",
                            maxWidth: "40px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => removeItemRow(item.id)}
                            className="inline-flex items-center justify-center w-7 h-7 p-0 rounded-md text-white 
                    hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 
                    focus:ring-offset-1 focus:ring-red-500 active:scale-95 bg-red-600 hover:bg-red-700"
                          >
                            <Trash2
                              size={16}
                              className="text-sm leading-none"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </fieldset>

          {/* Financial Calculation Configuration Group */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              Payment Details
            </legend>
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-sm mb-1.75">Tax %</label>
                <input
                  type="number"
                  name="taxPercent"
                  value={formData.taxPercent}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div>
                <label className="block text-sm mb-1.75">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Dynamic Footer Comments Group */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              Comment Details
            </legend>
            <div className="pt-1">
              <label className="block text-sm mb-1.75">Comment 1</label>
              <input
                type="text"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </fieldset>

          {/* Storage & Export File Target Metadata Group */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              File Details
            </legend>
            <div className="pt-1">
              <label className="block text-sm mb-1.75">File Name *</label>
              <input
                type="text"
                name="fileName"
                value={formData.fileName}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
          </fieldset>

          {/* Accept Conditions Validation Checkbox */}
          <fieldset className="border border-[#555] rounded-[10px] p-4 relative">
            <legend className="text-sm font-semibold text-[#d97706] px-1.25 absolute -top-3.25 left-3 bg-white">
              Terms and Conditions
            </legend>
            <div className="pt-1">
              <span className="text-sm block mb-1.75">
                I accept the terms and conditions
              </span>
              <label className="flex items-center space-x-2 text-sm ">
                <input
                  type="checkbox"
                  checked={formData.isTermsChecked}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isTermsChecked: e.target.checked }))}
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <p>
                  I have read the
                  <span className="text-blue-700 hover:underline font-medium cursor-pointer">
                    {" "}
                    terms and conditions.
                  </span>
                </p>
              </label>
            </div>
          </fieldset>

          {/* Bottom Execution Control Triggers */}

          <div className="flex flex-wrap gap-3 items-center pt-2">
            <button
              type="button"
              onClick={downloadPDF}
              disabled={!isFormValid}
              className={`flex items-center gap-2 bg-blue-500 hover:bg-blue-600 ${ isFormValid ? "cursor-pointer": "cursor-not-allowed opacity-60"}
              text-white font-medium text-sm py-2.5 px-5 rounded-md shadow transition-colors`}
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>

            {/* Custom dropdown matching image 1 */}
            <div className="relative">
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="appearance-none border border-gray-300 text-sm py-2.5 pl-4 pr-9 rounded-md bg-white 
              text-gray-700 font-medium focus:outline-none hover:ring-blue-400 hover:ring-2 cursor-pointer
               hover:border-gray-400 transition-colors shadow-sm"
              >
                <option value="thermal80">Thermal 80mm</option>
                <option value="a4">A4</option>
                <option value="a3">A3</option>
              </select>
              {/* Custom caret icon matching image 1 */}
              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                <ChevronDown size={15} className="text-gray-500" />
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 border border-red-300 text-red-500 hover:bg-red-50 
              font-medium text-sm py-2.5 px-4 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN - REAL TIME LIVE PREVIEW WRAPPER                              */}
        <div className="md:sticky md:top-2 self-start lg:col-span-5 flex flex-col items-center font-montserrat">
          <div className="w-full text-left mb-3">
            <h3 className="text-sm font-semibold text-gray-500">
              Live Preview
            </h3>
          </div>

          <div
            ref={receiptRef}
            data-receipt
            style={{
              width: "320px",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              padding: "24px",
              fontFamily: "'Lato', sans-serif",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <h1
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  lineHeight: "1.3",
                  margin: "0 0 4px 0",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {formData.restaurantName}
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  fontFamily: "'Lato', sans-serif",
                  color: "#444",
                  margin: "0 0 8px 0",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                }}
              >
                {formData.restaurantTagline}
              </p>
              <div style={{ borderTop: "2.5px solid #111", margin: "8px 0" }} />
            </div>

            {/* Customer Name */}
            <div
              style={{ fontSize: "14px", color: "#111", marginBottom: "4px" }}
            >
              <span style={{ fontWeight: "600" }}>Name :</span>
              <span style={{ marginLeft: "4px", wordBreak: "break-word" }}>
                {formData.customerName}
              </span>
              <div style={{ borderTop: "2.5px solid #111", margin: "8px 0" }} />
            </div>

            {/* Bill Meta */}
            <div style={{ marginBottom: "4px" }}>
              {/* Date + Order Type */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  fontSize: "14px",
                }}
              >
                <div style={{ width: "50%" }}>
                  <span style={{ fontWeight: "600" }}>Date:</span>
                  <span style={{ marginLeft: "4px" }}>
                    {formatDisplayDate(formData.billDate)}
                  </span>
                </div>
                <div
                  style={{ width: "45%", fontWeight: "700", fontSize: "15px" }}
                >
                  {formData.orderType}
                </div>
              </div>

              {/* Time */}
              <div style={{ fontSize: "14px", marginTop: "2px" }}>
                {formData.billTime}
              </div>

              {/* Cashier + Bill No */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  fontSize: "14px",
                  marginTop: "6px",
                }}
              >
                <div style={{ width: "50%" }}>
                  <span style={{ fontWeight: "600" }}>Cashier:</span>
                  <span style={{ marginLeft: "4px" }}>
                    {formData.cashierName}
                  </span>
                </div>
                <div
                  style={{
                    width: "45%",
                    display: "flex",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontWeight: "600", whiteSpace: "nowrap" }}>
                    Bill No.:
                  </span>
                  <span style={{ marginLeft: "4px", wordBreak: "break-all" }}>
                    {formData.billNo}
                  </span>
                </div>
              </div>

              {/* Token */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  marginTop: "6px",
                  marginBottom: "6px",
                }}
              >
                <span>Token No.:</span>
                <span style={{ marginLeft: "4px" }}>
                  {formData.tokenNumber}
                </span>
              </div>

              <div style={{ borderTop: "2.5px solid #111", margin: "6px 0" }} />
            </div>

            {/* Items Table */}
            <table
              style={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2.5px solid #111" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "4px 4px 4px 0",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      fontWeight: "600",
                      width: "38%",
                    }}
                  >
                    Item
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "4px 0",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      fontWeight: "600",
                      width: "12%",
                    }}
                  >
                    Qty.
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "4px 0",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      fontWeight: "600",
                      width: "22%",
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "4px 0 4px 4px",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      fontWeight: "600",
                      width: "28%",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {items
                  .filter(
                    (item) =>
                      item.description.trim() !== "" && Number(item.qty) > 0,
                  )
                  .map((item, index, arr) => {
                    const amt =
                      (Number(item.price) || 0) * (Number(item.qty) || 0);
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom:
                            index !== arr.length - 1
                              ? "1px solid #e5e7eb"
                              : "none",
                          verticalAlign: "top",
                        }}
                      >
                        <td
                          style={{
                            padding: "7px 4px 7px 0",
                            fontSize: "13px",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.description}
                        </td>
                        <td
                          style={{
                            padding: "7px 0",
                            fontSize: "13px",
                            textAlign: "center",
                          }}
                        >
                          {item.qty}
                        </td>
                        <td
                          style={{
                            padding: "7px 0",
                            fontSize: "13px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {(Number(item.price) || 0).toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "7px 0 7px 4px",
                            fontSize: "13px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {amt.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                {items.filter(
                  (i) => i.description.trim() !== "" && Number(i.qty) > 0,
                ).length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        color: "#9ca3af",
                        fontStyle: "italic",
                      }}
                    >
                      No items added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ borderTop: "2.5px solid #111", margin: "4px 0" }} />

            {/* Totals */}
            <div style={{ marginBottom: "4px" }}>
              {/* Subtotal row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 0",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Qty: {totalQty}
                </p>
                <p style={{ fontSize: "13px", margin: 0, textAlign: "right" }}>
                  Sub Total {formData.currencySymbol} {subTotal.toFixed(2)}
                </p>
              </div>

              {/* Tax row */}
              {/* {Number(formData.taxPercent) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    padding: "2px 0",
                    color: "#374151",
                  }}
                >
                  <span>Tax ({formData.taxPercent}%)</span>
                  <span>
                    {formData.currencySymbol} {taxAmount.toFixed(2)}
                  </span>
                </div>
              )} */}

              {/* Discount row */}
              {/* {Number(formData.discount) > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    padding: "2px 0",
                    color: "#374151",
                  }}
                >
                  <span>Discount</span>
                  <span>
                    - {formData.currencySymbol}{" "}
                    {Number(formData.discount).toFixed(2)}
                  </span>
                </div>
              )} */}

              <div style={{ borderTop: "2.5px solid #111", margin: "4px 0" }} />

              {/* Grand Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 0",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>Grand Total</span>
                <span style={{ wordBreak: "break-word" }}>
                  {formData.currencySymbol} {grandTotal.toFixed(2)}
                </span>
              </div>

              <div style={{ borderTop: "2.5px solid #111", margin: "4px 0" }} />
            </div>

            {/* Footer Comment */}
            {formData.comment && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: "13px",
                  paddingTop: "4px",
                  color: "#374151",
                  wordBreak: "break-word",
                }}
              >
                {formData.comment}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-4 italic">
            PDF downloads are currently available without watermark.
          </p>
        </div>
      </div>
    </div>
  );
}
