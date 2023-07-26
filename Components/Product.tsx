import React, { useState } from "react";
import { Checkbox } from "./UI/checkbox";
import { Separator } from "./UI/separator";

interface IProduct {
  id: string;
  name: string;
  isChecked: boolean;
}

interface ISaveProductEdited {
  categoryId: string;
  productEdited: string;
  productId: string;
}

interface ISetProductToComplete {
  productId: string;
  categoryId: string;
}
interface ProductsProps {
  categoryId: string;
  product: IProduct;
  saveProductEdited: (saveProductEditedObj: ISaveProductEdited) => void;
  setProductToComplete: (productCompleted: ISetProductToComplete) => void;
  // products: IProduct[];
}

export default function Product({
  product,
  saveProductEdited,
  categoryId,
  setProductToComplete,
}: ProductsProps) {
  const [newProduct, setNewProduct] = useState<string>(product.name);

  return (
    <div className="flex px-2 py-2 items-center">
      <label htmlFor={product.id}>
        {product.name === "" ? (
          <div className="w-4 h-4 rounded-full border-dotted border-2 border-neutral-600 "></div>
        ) : (
          <Checkbox
            className="rounded-full"
            id={product.id}
            name={product.id}
            checked={product.isChecked}
            onCheckedChange={() => {
              const productComplete = {
                productId: product.id,
                categoryId: categoryId,
              };
              // setChecked(!checked)
              setProductToComplete(productComplete);
            }}
          />
        )}
      </label>
      <label htmlFor={product.name} className="w-full p-0 ml-2">
        <input
          className="w-full bg-transparent text-white focus:outline-none"
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
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              const productToSave = {
                categoryId: categoryId,
                productEdited: newProduct,
                productId: product.id,
              };
              saveProductEdited(productToSave);
            }
          }}
        />
        <Separator className="w-full mt-2 bg-neutral-600" />
      </label>
    </div>
  );
}
