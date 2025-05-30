import React, { useContext } from 'react';

const PreviewSheet = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="p-6 text-sm" ref="printRef">
      <h2 className="text-2xl font-bold mb-4">Product Price List</h2>

      <table className="w-full table-auto border-collapse border border-gray-300 text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Price</th>
            <th className="border border-gray-300 p-2">Warranty</th>
            <th className="border border-gray-300 p-2">Specs</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, idx) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{idx + 1}</td>
              <td className="border border-gray-300 p-2">{product.name}</td>
              <td className="border border-gray-300 p-2">R {product.price}</td>
              <td className="border border-gray-300 p-2">{product.warranty} yr</td>
              <td className="border border-gray-300 p-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PreviewSheet;
