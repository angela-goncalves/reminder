import React, { useState } from "react";
import { Checkbox } from "./UI/checkbox";

interface IProduct {
  id: string;
  name: string;
}

interface ISaveProductEdited {
  categoryId: string;
  productEdited: string;
  productId: string;
}

interface ProductsProps {
  categoryId: string;
  product: IProduct;
  saveProductEdited: (saveProductEditedObj: ISaveProductEdited) => void;
  moveProductToChecked: (productId: string, categoryId: string) => void;
}

export default function Product({
  product,
  saveProductEdited,
  categoryId,
  moveProductToChecked,
}: ProductsProps) {
  const [newProduct, setNewProduct] = useState<string>(product.name);

  return (
    <div className="flex px-2 py-1 items-center">
      <label htmlFor={product.id}>
        <Checkbox
          className="rounded-full"
          id={product.id}
          name={product.id}
          onCheckedChange={() => {
            moveProductToChecked(product.id, categoryId);
          }}
        />
      </label>
      <label htmlFor={product.name} className="w-full p-0 ml-2">
        <input
          className="pb-1 w-full bg-transparent text-white focus:outline-none"
          id={product.name}
          name={product.name}
          type="text"
          value={newProduct}
          onChange={(e) => {
            setNewProduct(e.target.value);
          }}
          onBlur={() => {
            const productToSave = {
              categoryId: categoryId,
              productEdited: newProduct,
              productId: product.id,
            };
            saveProductEdited(productToSave);
          }}
        />
      </label>
    </div>
  );
}
