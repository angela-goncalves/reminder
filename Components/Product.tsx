import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Checkbox } from "./UI/checkbox";
import { Separator } from "./UI/separator";
import DragIcon from "./Icon/dragIcon";
import { Input } from "./UI/input";

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
  color: "default" | "pink" | "violet" | "emerald" | "cyan" | "amber";
}

const Product = ({
  categoryId,
  product,
  saveProductEdited,
  setProductToComplete,
  color,
}: ProductsProps) => {
  const [newProduct, setNewProduct] = useState<string>(product.name);
  const productInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productInputRef.current) {
      productInputRef.current?.focus();
    }
  }, []);

  return (
    <div className="flex px-2 py-2 items-center">
      {product.name === "" ? (
        <div className="w-[18.5px] h-[18px] rounded-full border-dotted border-2" />
      ) : (
        <Checkbox
          variant={color}
          className="rounded-full mb-2"
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
      )}
      <div className="w-full flex flex-col p-0 mx-2">
        <div className="w-full">
          <Input
            className="w-full bg-transparent border-none focus:outline-none"
            id={product.id}
            name={product.id}
            variant={color}
            type="text"
            ref={productInputRef}
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
          <Separator className="w-full mt-2" />
        </div>
      </div>
      <DragIcon width="20px" height="20px" />
    </div>
  );
};

export default Product;
