import React, { useRef, useState } from "react";
import Products from "./Product";
import { Input } from "./UI/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/UI/accordion";
interface IProduct {
  id: string;
  name: string;
  isCompleted: boolean;
}
interface IReminder {
  id: string;
  categoryName: string;
  products: IProduct[];
}
interface ISaveProductEdited {
  categoryId: string;
  productEdited: string;
  productId: string;
}
interface ISaveCategoryEdited {
  categoryId: string;
  categoryEdited: string;
}
interface ISetProductToComplete {
  productId: string;
  categoryId: string;
}
interface ReminderProps {
  category: IReminder;
  saveCategoryEdited: (saveCategoryEditedObj: ISaveCategoryEdited) => void;
  setProductToComplete: (productCompleted: ISetProductToComplete) => void;
  saveProductEdited: (saveProductEditedObj: ISaveProductEdited) => void;
  show: boolean;
}

export default function Reminders({
  category,
  saveCategoryEdited,
  saveProductEdited,
  setProductToComplete,
  show,
}: ReminderProps) {
  const [newCategory, setNewCategory] = useState<string>(category.categoryName);

  return (
    <div>
      <Accordion
        type="single"
        defaultValue={category.categoryName}
        collapsible
        className="w-full">
        <AccordionItem value={category.categoryName}>
          <div className="pl-0 pt-2 flex w-full justify-between">
            <label htmlFor={category.categoryName}>
              <Input
                id={category.categoryName}
                className="p-2 bg-transparent border-none text-xl font-bold text-white focus:outline-none"
                value={newCategory}
                name={category.categoryName}
                type="text"
                onChange={(e) => {
                  setNewCategory(e.target.value);
                }}
                onBlur={() => {
                  const categroyToSave = {
                    categoryId: category.id,
                    categoryEdited: newCategory,
                  };
                  saveCategoryEdited(categroyToSave);
                }}
              />
            </label>
            <AccordionTrigger></AccordionTrigger>
          </div>
          <AccordionContent>
            {category.products.map((product) => {
              return (
                <Products
                  key={product.id}
                  product={product}
                  saveProductEdited={saveProductEdited}
                  categoryId={category.id}
                  setProductToComplete={setProductToComplete}
                />
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
