import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState } from "react";
import Reminders from "@/Components/Reminders";
import { Button } from "@/Components/UI/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Input } from "@/Components/UI/input";

const inter = Inter({ subsets: ["latin"] });

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
  const [darkMode, setDarkMode] = useState(false);

  const { setTheme } = useTheme();

  function dec2hex(dec: number) {
    return dec.toString(16).padStart(2, "0");
  }
  function generateId(len: number) {
    var arr = new Uint8Array((len || 20) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
  }

  const handleReminders = (product: string, category: string) => {
    const categoriesCopy = [...listReminders];
    const categoryObj = categoriesCopy.find(
      (obj) => obj.categoryName === category
    );

    if (categoryObj) {
      const isProductEmpy = categoryObj.products.find(
        (item) => item.name === ""
      );
      categoryObj.products.push({
        id: generateId(15),
        name: product,
        isChecked: false,
      });
      if (!isProductEmpy) {
        categoryObj.products.push({
          id: generateId(16),
          name: "",
          isChecked: false,
        });
      }
    } else {
      categoriesCopy.push({
        id: generateId(15),
        categoryName: category,
        products: [
          {
            id: generateId(15),
            name: product,
            isChecked: false,
          },
          {
            id: generateId(16),
            name: "",
            isChecked: false,
          },
        ],
      });
    }
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
    const categoriesCopy = [...listReminders];
    const categoryObj = categoriesCopy.find(
      (cat) => cat.id === productCategoryIds.categoryId
    );

    if (categoryObj) {
      const productObj = categoryObj.products.find(
        (product) => product.id === productCategoryIds.productId
      );
      if (productObj) {
        productObj.isChecked = !productObj.isChecked;
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
        if (objProductToEdited.productEdited === "") {
          const productIndex = categoryObj.products.findIndex(
            (product) => product.id === objProductToEdited.productId
          );

          if (productIndex !== -1) {
            categoryObj.products.splice(productIndex, 1);
          }
        }
        productObj.name = objProductToEdited.productEdited;
      } else {
        categoryObj.products.push({
          id: objProductToEdited.productId,
          name: objProductToEdited.productEdited,
          isChecked: false,
        });
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

  const changePosition = (newProductsIndex: any) => {
    const categoryObj = listReminders.find(
      (obj) => obj.id === newProductsIndex.categoryId
    );
    const newListReminders = listReminders.map((item) => {
      if (item.id === categoryObj?.id) {
        return { ...item, products: newProductsIndex.products };
      }
      return item;
    });
    setListReminders(newListReminders);
  };

  const filterCheckedAndEmptyProduct = listReminders.filter((category) => {
    let nonEmptyProducts = category.products.filter(
      (product) => product.name !== ""
    );
    return (
      nonEmptyProducts.length === 0 ||
      nonEmptyProducts.some((product) => !product.isChecked)
    );
  });

  const renderIfShow = show ? listReminders : filterCheckedAndEmptyProduct;
  return (
    <main className={`flex w-full flex-col p-4 ${inter.className}`}>
      <div className="self-end flex flex-col space-y-2 flex-initial">
        {!darkMode && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setTheme("light");
              setDarkMode(true);
            }}>
            <SunIcon className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        )}
        {darkMode && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setTheme("dark");
              setDarkMode(false);
            }}>
            <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        )}
        <button
          onClick={() => {
            setShow(!show);
          }}
          className="underline">
          {show ? <h3>hide</h3> : <h3>show</h3>}
        </button>
      </div>
      <div className="h-screenH w-full ">
        <div className="flex w-full flex-auto flex-col">
          {renderIfShow.map((reminder) => (
            <Reminders
              key={reminder.id}
              showNoChecked={show}
              saveCategoryEdited={saveCategoryEdited}
              category={reminder}
              setProductToComplete={setProductToComplete}
              saveProductEdited={saveProductEdited}
              changePosition={changePosition}
            />
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="primary-input">
            <Input
              className="bg-transparent flex-initial w-full p-6 focus:outline-none mt-12"
              value={input}
              type="text"
              id="primary-input"
              name="primary-input"
              placeholder="What do you want to buy..."
              onChange={handleInputChange}
            />
          </label>
        </form>
      </div>
    </main>
  );
}
