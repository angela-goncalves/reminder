import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState } from "react";
import Reminders from "@/Components/Reminders";
import {
  AccordionContent,
  AccordionItem,
  Accordion,
  AccordionTrigger,
} from "@/Components/UI/accordion";

const inter = Inter({ subsets: ["latin"] });

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

export default function Home() {
  const [listReminders, setListReminders] = useState<IReminder[]>([]);
  const [show, setShow] = useState<boolean>(false);

  function dec2hex(dec: number) {
    return dec.toString(16).padStart(2, "0");
  }
  function generateId(len: number) {
    var arr = new Uint8Array((len || 20) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
  }

  const handleReminders = (product: string, category: string) => {
    let categoriesCopy = [...listReminders];
    let categoryObj = categoriesCopy.find(
      (obj) => obj.categoryName === category
    );

    if (categoryObj) {
      categoryObj.products.push({
        id: generateId(15),
        name: product,
        isCompleted: false,
      });
    } else {
      categoriesCopy.push({
        id: generateId(15),
        categoryName: category,

        products: [
          {
            id: generateId(15),
            name: product,
            isCompleted: false,
          },
        ],
      });
    }
    // Update state
    setListReminders(categoriesCopy);
  };

  // SDK
  const {
    completion,
    handleSubmit,
    input,
    handleInputChange,
    isLoading,
    setInput,
  } = useCompletion({
    api: "/api/completion",
    onFinish: (product, categories) => {
      setInput("");
      handleReminders(product, categories);
    },
  });

  const setProductToComplete = (productCategoryIds: ISetProductToComplete) => {
    // Copy current states
    let categoriesCopy = [...listReminders];
    let categoryObj = categoriesCopy.find(
      (cat) => cat.id === productCategoryIds.categoryId
    );

    if (categoryObj) {
      let productObj = categoryObj.products.find(
        (product) => product.id === productCategoryIds.productId
      );

      if (productObj) {
        productObj.isCompleted = !productObj.isCompleted;
      }
    }

    setListReminders(categoriesCopy);
  };

  const saveProductEdited = (objProductToEdited: ISaveProductEdited) => {
    const listCopy = [...listReminders];
    const categoryObj = listCopy.find(
      (obj) => obj.id === objProductToEdited.categoryId
    );

    if (categoryObj) {
      const productObj = categoryObj.products.find(
        (product) => product.id === objProductToEdited.productId
      );

      if (productObj) {
        productObj.name = objProductToEdited.productEdited;
      }
    }
    setListReminders(listCopy);
  };

  const saveCategoryEdited = (objCategoryToEdit: ISaveCategoryEdited) => {
    const listReminderCopy = [...listReminders];
    const categoryObj = listReminderCopy.find(
      (obj) => obj.id === objCategoryToEdit.categoryId
    );

    if (categoryObj) {
      categoryObj.categoryName = objCategoryToEdit.categoryEdited;
    }

    setListReminders(listReminderCopy);
  };

  const productsChecked = listReminders.filter((category) =>
    category.products.some((product) => product.isCompleted)
  );

  // console.log("productsCompleted", productsCompleted);
  // console.log("isCompleted", isCompleted);
  // console.log("show", show);
  return (
    <main
      className={`flex w-full min-h-screen flex-col justify-between p-4 ${inter.className}`}>
      <p>Current state: {isLoading ? "Generating..." : "Ready"}</p>
      <div className="flex w-full h-screenH flex-col relative">
        {productsChecked.length === 0 ? (
          <></>
        ) : (
          <button
            onClick={() => {
              setShow(!show);
            }}
            className="underline">
            {show ? <h3>show less</h3> : <h3>show all</h3>}
          </button>
        )}
        {show
          ? listReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex flex-col divide-gray-00 divide-y-2 divide-y-reverse">
                <Reminders
                  show={show}
                  saveCategoryEdited={saveCategoryEdited}
                  category={reminder}
                  setProductToComplete={setProductToComplete}
                  saveProductEdited={saveProductEdited}
                />
                <div></div>
              </div>
            ))
          : listReminders
              .filter((category) =>
                category.products.some((product) => !product.isCompleted)
              )
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex flex-col divide-gray-00 divide-y-2 divide-y-reverse">
                  <Reminders
                    show={show}
                    saveCategoryEdited={saveCategoryEdited}
                    category={reminder}
                    setProductToComplete={setProductToComplete}
                    saveProductEdited={saveProductEdited}
                  />
                  <div></div>
                </div>
              ))}

        <form onSubmit={handleSubmit}>
          <label htmlFor="primary-input" className="flex flex-col">
            <input
              className="w-full bg-transparent p-2 text-white focus:outline-none absolute bottom-0"
              value={input}
              type="text"
              id="primary-input"
              name="primary-input"
              placeholder="Enter your prompt..."
              onChange={handleInputChange}
            />
          </label>
        </form>
      </div>
    </main>
  );
}
