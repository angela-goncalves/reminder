import React, { useState, forwardRef } from "react";
import { Checkbox } from "./UI/checkbox";
import { Separator } from "./UI/separator";
import Image from "next/image";
import { Input } from "./UI/input";
import { Reorder, DragControls } from "framer-motion";
import DragIcon from "./Icon/dragIcon";

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
  dragControls: DragControls;
  darkMode: boolean;
  color: "default" | "pink" | "violet" | "emerald" | "cyan" | "amber";
}

const Product = forwardRef<HTMLDivElement, ProductsProps>(
  (
    {
      product,
      saveProductEdited,
      categoryId,
      setProductToComplete,
      dragControls,
      darkMode,
      color,
    },
    ref
  ) => {
    const [newProduct, setNewProduct] = useState<string>(product.name);

    return (
      <div className="flex px-2 py-2 items-center" ref={ref}>
        {product.name === "" ? (
          <div className="w-4 h-4 rounded-full border-dotted border-2"></div>
        ) : (
          <label htmlFor={product.id}>
            <Checkbox
              variant={color}
              className="rounded-full"
              id={product.id}
              name={product.id}
              color={color}
              checked={product.isChecked}
              onCheckedChange={() => {
                setProductToComplete({
                  productId: product.id,
                  categoryId: categoryId,
                });
              }}
            />
          </label>
        )}
        <div className="w-full flex flex-col p-0 ml-2">
          <div className="w-full flex items-center">
            <label htmlFor={product.name} className="w-full">
              <Input
                className="bg-transparent border-none focus:outline-none"
                id={product.name}
                name={product.name}
                type="text"
                variant={color}
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
            <DragIcon width="20px" height="20px" darkMode={darkMode} />
          </div>
          <Separator className="w-full mt-2" />
        </div>
      </div>
    );
  }
);
export default Product;
