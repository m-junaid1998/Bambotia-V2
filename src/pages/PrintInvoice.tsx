import React from "react";
interface PrintInvoiceProps {
  orderNumber: string;
  customer: {
    fullName: string;
    phone: string;
    address: string;
    areaTown?: string;
    city?: string;
  };
  items?: Array<{
    productId: string | number;
    name: string;
    image?: string;
    quantity: number;
    price: number;
  }>;
  subtotal?: number;
  shipping?: number;
  total?: number;
  paymentMethod: string;
  placedAt: string;
  status?: string;
}

const PrintInvoice = ({
  orderNumber,
  customer,
  items = [],
  subtotal = 0,
  shipping = 0,
  total = 0,
  paymentMethod,
  placedAt,
  status = "Confirmed", 
}: PrintInvoiceProps) => {
  return (
    <div
      id="print-invoice"
      className="bg-white text-black min-h-screen p-10 font-sans"
    >
      <div className="flex items-start justify-between border-b-2 border-black pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-widest uppercase text-black">
            BAMBOTIA
          </h1>
          <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider font-semibold">
            Luxury Jewellery & Fashion Store
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
            Invoice
          </p>
          <h2 className="text-2xl font-black mt-1 tracking-tight">#{orderNumber}</h2>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            {placedAt ? new Date(placedAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }) : ""}
          </p>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xs uppercase font-black mb-3 border-l-4 border-black pl-2 tracking-wider text-gray-900">
            Customer Details
          </h3>
          <div className="space-y-1 text-sm text-gray-800">
            <p>
              <span className="font-bold text-black">Name:</span> {customer?.fullName}
            </p>
            <p>
              <span className="font-bold text-black">Phone:</span> {customer?.phone}
            </p>
            <p className="leading-relaxed">
              <span className="font-bold text-black">Address:</span> {customer?.address}
              {customer?.areaTown ? `, ${customer.areaTown}` : ""}
              {customer?.city ? `, ${customer.city}` : ""}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase font-black mb-3 border-l-4 border-black pl-2 tracking-wider text-gray-900">
            Order Details
          </h3>
          <div className="space-y-1 text-sm text-gray-800">
            <p>
              <span className="font-bold text-black">Payment:</span> {paymentMethod}
            </p>
            <p>
              <span className="font-bold text-black">Status:</span>{" "}
              <span className="uppercase font-extrabold text-xs tracking-wide">{status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="mt-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-50">
              <th className="text-left py-2.5 px-2 w-[13%] text-[10px] uppercase font-black tracking-wider text-gray-700">
                P:ID
              </th>
              <th className="text-left py-2.5 px-2 w-[15%] text-[10px] uppercase font-black tracking-wider text-gray-700">
                Image
              </th>
              <th className="text-left py-2.5 px-2 text-[10px] uppercase font-black tracking-wider text-gray-700">
                Product Name
              </th>
              <th className="text-center py-2.5 px-2 w-[10%] text-[10px] uppercase font-black tracking-wider text-gray-700">
                Qty
              </th>
              <th className="text-right py-2.5 px-2 w-[15%] text-[10px] uppercase font-black tracking-wider text-gray-700">
                Price
              </th>
              <th className="text-right py-2.5 px-2 w-[17%] text-[10px] uppercase font-black tracking-wider text-gray-700">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const pId = item.productId || index;
              const qty = item.quantity || 1;
              const price = item.price || 0;

              return (
                <tr
                  key={pId}
                  className="border-b border-gray-200 last:border-b-2 last:border-black break-inside-avoid"
                >
                  <td className="py-3 px-2 text-xs font-mono text-gray-500">
                    #{String(pId).slice(-6).toUpperCase()}
                  </td>
                  <td className="py-3 px-2">
                    <img
                      src={item.image}
                      alt={item.image}
                      className="w-12 h-12 object-cover rounded border border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {item.name}
                    </p>
                  </td>
                  <td className="py-3 px-2 text-center text-sm font-medium">
                    {qty}
                  </td>
                  <td className="py-3 px-2 text-right text-sm font-medium">
                    Rs {price.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right text-sm font-bold text-black">
                    Rs {(price * qty).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-6 break-inside-avoid">
        <div className="w-full max-w-xs border-2 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-600 uppercase font-bold tracking-tight">Subtotal</span>
            <span className="font-bold text-black">
              Rs {subtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-xs mb-3">
            <span className="text-gray-600 uppercase font-bold tracking-tight">Shipping</span>
            <span className="font-extrabold text-emerald-800">
              {shipping === 0 ? "FREE" : `Rs ${shipping.toLocaleString()}`}
            </span>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-3 flex justify-between items-center">
            <span className="font-black text-sm uppercase tracking-wider">
              Grand Total
            </span>
            <span className="font-black text-xl text-black">
              Rs {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-200 pt-6 text-center break-inside-avoid">
        <p className="text-xs font-black uppercase tracking-widest mb-1 text-black">
          Thank you for shopping with BAMBOTIA
        </p>
        <p className="text-[9px] text-gray-500 font-medium max-w-xs mx-auto leading-normal">
          This is a computer-generated official document and does not require a physical signature or stamp.
        </p>
      </div>
    </div>
  );
};

export default PrintInvoice;