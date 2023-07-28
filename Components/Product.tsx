import React, { useState } from "react";
import { Checkbox } from "./UI/checkbox";
import { Separator } from "./UI/separator";
import Image from "next/image";

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
}

const Product = React.forwardRef<HTMLDivElement, ProductsProps>(
  ({ product, saveProductEdited, categoryId, setProductToComplete }, ref) => {
    const [newProduct, setNewProduct] = useState<string>(product.name);

    return (
      <div className="flex px-2 py-2 items-center" ref={ref}>
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
                setProductToComplete({
                  productId: product.id,
                  categoryId: categoryId,
                });
              }}
            />
          )}
        </label>
        <div className="w-full flex flex-col p-0 ml-2">
          <div className="w-full flex items-center">
            <label htmlFor={product.name} className="w-full">
              <input
                className="bg-transparent text-white focus:outline-none"
                id={product.name}
                name={product.name}
                type="text"
                value={newProduct}
                onChange={(e) => {
                  setNewProduct(e.target.value);
                }}
                onBlur={() => {
                  saveProductEdited({
                    categoryId: categoryId,
                    productEdited: newProduct,
                    productId: product.id,
                  });
                }}
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    saveProductEdited({
                      categoryId: categoryId,
                      productEdited: newProduct,
                      productId: product.id,
                    });
                  }
                }}
              />
            </label>
            {product.name !== "" && (
              <Image
                alt="icon to drag the product"
                width={25}
                height={25}
                src="/dragIcon.svg"
              />
            )}
          </div>
          <Separator className="w-full mt-2 bg-neutral-600" />
        </div>
      </div>
    );
  }
);
export default Product;
