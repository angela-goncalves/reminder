import React, { useState } from "react";
import { Input } from "./UI/input";
import { Button } from "./UI/button";
interface IProduct {
  id: string;
  name: string;
  isChecked: boolean;
}
interface IReminder {
  id: string;
  categoryName: string;
  products: IProduct[];
}
interface ISaveCategoryEdited {
  categoryId: string;
  categoryEdited: string;
}

interface ReminderProps {
  category: IReminder;
  saveCategoryEdited: (saveCategoryEditedObj: ISaveCategoryEdited) => void;
  deleteCategory: (category: string) => void;
}

export default function Reminders({
  category,
  saveCategoryEdited,
  deleteCategory,
}: ReminderProps) {
  const [newCategory, setNewCategory] = useState<string>(category.categoryName);

  return (
    <div className="pl-0 pt-6 flex w-full justify-between">
      <label htmlFor={category.categoryName} className="w-full">
        <Input
          id={category.categoryName}
          className="p-2 bg-transparent border-none text-xl font-bold mb-4"
          value={newCategory}
          name={category.categoryName}
          type="text"
          onChange={(e) => {
            setNewCategory(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              e.preventDefault();
              saveCategoryEdited({
                categoryId: category.id,
                categoryEdited: newCategory,
              });
            }
          }}
        />
      </label>
    </div>
  );
}
