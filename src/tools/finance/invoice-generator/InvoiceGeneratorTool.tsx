"use client";

import React, { useState } from "react";
import { Plus, Trash2, Printer, FileText, DollarSign, ShieldCheck } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceGeneratorTool() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-001");
  const [issueDate, setIssueDate] = useState("2026-10-20");
  const [dueDate, setDueDate] = useState("2026-11-20");
  const [currency, setCurrency] = useState("$");

  // Business info
  const [businessName, setBusinessName] = useState("Acme Studio Inc.");
  const [businessEmail, setBusinessEmail] = useState("billing@acmestudio.com");
  const [businessAddress, setBusinessAddress] = useState("100 Innovation Way, Suite 400\nSan Francisco, CA 94107");

  // Client info
  const [clientName, setClientName] = useState("Globex Corporation");
  const [clientEmail, setClientEmail] = useState("accounts@globex.org");
  const [clientAddress, setClientAddress] = useState("742 Evergreen Terrace\nSpringfield, OR 97477");

  // Items
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "Website UI/UX Redesign & Optimization", quantity: 1, rate: 2500 },
    { id: "2", description: "Full-Stack Development (Milestone 1)", quantity: 40, rate: 85 },
    { id: "3", description: "Performance Tuning & Cloud Setup", quantity: 1, rate: 600 },
  ]);

  const [taxPercent, setTaxPercent] = useState<string>("8.5");
  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [notes, setNotes] = useState("Thank you for your business. Payment is due within 30 days of issue.");

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "New service item",
        quantity: 1,
        rate: 100,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate || 0), 0);
  const taxRate = parseFloat(taxPercent) || 0;
  const tax = subtotal * (taxRate / 100);
  const discount = parseFloat(discountAmount) || 0;
  const total = Math.max(0, subtotal + tax - discount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 bg-white border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Printable Invoice Generator
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Customize details below. Click Print to save as PDF or print directly from your browser.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 border-2 border-black rounded-xl font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all text-black"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Security notice */}
      <div className="print:hidden bg-blue-50 border-2 border-blue-400 p-3 rounded-xl flex items-center gap-2 text-xs text-blue-900 font-semibold shadow-[2px_2px_0px_0px_rgba(59,130,246,1)]">
        <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
        All invoice information is rendered locally inside your browser. No financial data or credentials are submitted or stored.
      </div>

      {/* Invoice Document Canvas */}
      <div className="bg-white border-4 border-black p-8 sm:p-10 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Header: Business & Invoice Meta */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b-4 border-black pb-6">
          <div className="space-y-2 flex-1">
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="text-2xl sm:text-3xl font-black w-full border-b border-dashed border-gray-300 focus:border-black focus:outline-none bg-transparent"
              placeholder="Your Business Name"
            />
            <input
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className="text-sm font-semibold text-gray-700 w-full border-b border-dashed border-gray-300 focus:border-black focus:outline-none bg-transparent"
              placeholder="billing@yourdomain.com"
            />
            <textarea
              rows={2}
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="text-xs text-gray-600 w-full border-b border-dashed border-gray-300 focus:border-black focus:outline-none bg-transparent resize-none"
              placeholder="Business Address"
            />
          </div>

          <div className="sm:text-right space-y-1.5 min-w-[200px]">
            <span className="text-3xl sm:text-4xl font-black tracking-wider text-black block">INVOICE</span>
            <div className="flex sm:justify-end items-center gap-2 text-xs font-bold text-gray-700">
              <span>Invoice #:</span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-28 text-right font-mono font-bold border-b border-dashed border-gray-400 focus:border-black bg-transparent"
              />
            </div>
            <div className="flex sm:justify-end items-center gap-2 text-xs font-bold text-gray-700">
              <span>Issue Date:</span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-32 text-right border-b border-dashed border-gray-400 focus:border-black bg-transparent"
              />
            </div>
            <div className="flex sm:justify-end items-center gap-2 text-xs font-bold text-gray-700">
              <span>Due Date:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-32 text-right border-b border-dashed border-gray-400 focus:border-black bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-gray-50 border-2 border-black p-4 rounded-xl space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-gray-600 block">Bill To:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client / Company Name"
                className="text-base font-bold w-full border-b border-dashed border-gray-300 focus:border-black bg-transparent"
              />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@company.com"
                className="text-xs text-gray-600 w-full border-b border-dashed border-gray-300 focus:border-black bg-transparent"
              />
            </div>
            <div>
              <textarea
                rows={2}
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Client Street, City, ZIP"
                className="text-xs text-gray-600 w-full border-b border-dashed border-gray-300 focus:border-black bg-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-xs font-black uppercase text-gray-700">
                  <th className="py-2 px-2">Description</th>
                  <th className="py-2 px-2 w-20 text-center">Qty</th>
                  <th className="py-2 px-2 w-28 text-right">Rate ({currency})</th>
                  <th className="py-2 px-2 w-28 text-right">Amount ({currency})</th>
                  <th className="py-2 px-2 w-10 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="w-full font-semibold border-b border-transparent focus:border-gray-400 bg-transparent text-sm"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-full text-center font-mono font-bold border-b border-transparent focus:border-gray-400 bg-transparent"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        className="w-full text-right font-mono font-bold border-b border-transparent focus:border-gray-400 bg-transparent"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-black">
                      {(item.quantity * item.rate).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center print:hidden">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= 1}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-20 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="print:hidden">
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded-lg font-bold text-xs bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* Calculation Summary & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 border-black pt-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">Payment Notes & Terms:</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 border-2 border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-black resize-none"
            />
          </div>

          <div className="space-y-2 text-sm font-bold">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-mono">{currency}{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-1 text-gray-600">
                <span>Tax Rate (%):</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-14 px-1 py-0.5 border border-gray-300 rounded text-right font-mono text-xs"
                />
              </div>
              <span className="font-mono">+{currency}{tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-1 text-gray-600">
                <span>Discount ({currency}):</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-16 px-1 py-0.5 border border-gray-300 rounded text-right font-mono text-xs"
                />
              </div>
              <span className="font-mono text-emerald-700">-{currency}{discount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center border-t-2 border-black pt-3 text-lg font-black bg-gray-50 p-3 rounded-xl border">
              <span>Total Due:</span>
              <span className="font-mono text-xl text-emerald-700">{currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
