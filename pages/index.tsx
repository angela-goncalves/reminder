import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import Reminders from "@/Components/Reminders";
import { Button } from "@/Components/UI/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Input } from "@/Components/UI/input";
import { Reorder, useDragControls, motion } from "framer-motion";
import Product from "@/Components/Product";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/UI/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/UI/accordion";

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

// interface IReminder {
//   category: string;
//   id: string;
//   product: string;
//   isChecked: boolean;
// }
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

function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, "0");
}
function generateId(len: number) {
  var arr = new Uint8Array((len || 20) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join("");
}

export default function Home() {
  const [listReminders, setListReminders] = useState<IReminder[]>([]);
  const [color, setColor] = useState<string>("-pink-500");
  const [show, setShow] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(false);

  const { setTheme } = useTheme();
  const dragControls = useDragControls();

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
      // if (!isProductEmpy) {
      //   categoryObj.products.push({
      //     id: generateId(16),
      //     name: "",
      //     isChecked: false,
      //   });
      // }
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
          // {
          //   id: generateId(16),
          //   name: "",
          //   isChecked: false,
          // },
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
    setInput("");
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

  const filterCheckedAndEmptyProduct = listReminders.filter((category) => {
    let nonEmptyProducts = category.products.filter(
      (product) => product.name !== ""
    );
    return (
      nonEmptyProducts.length === 0 ||
      nonEmptyProducts.some((product) => !product.isChecked)
    );
  });

  const onDragStart = (e: any, productId: string) => {
    e.dataTransfer.setData("productId", productId);
  };

  const onDrop = (e: React.DragEvent, categoryId: string, index: number) => {
    e.preventDefault();
    const productId = e.dataTransfer.getData("productId");

    // Find the source and destination categories and product
    let sourceCategoryIndex: number | undefined;
    let product: IProduct | undefined;

    listReminders.forEach((category, categoryIndex) => {
      const foundProductIndex = category.products.findIndex(
        (prod) => prod.id === productId
      );
      if (foundProductIndex !== -1) {
        product = category.products[foundProductIndex];
        sourceCategoryIndex = categoryIndex;
      }
    });

    const destinationCategoryIndex = listReminders.findIndex(
      (category) => category.id === categoryId
    );

    if (
      sourceCategoryIndex !== undefined &&
      destinationCategoryIndex !== -1 &&
      product
    ) {
      // Remove the product from the source category
      listReminders[sourceCategoryIndex].products.splice(
        listReminders[sourceCategoryIndex].products.findIndex(
          (prod) => prod.id === productId
        ),
        1
      );

      // Insert the product into the destination category at the specified index
      listReminders[destinationCategoryIndex].products.splice(
        index,
        0,
        product
      );

      setListReminders([...listReminders]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderIfShow = show ? listReminders : filterCheckedAndEmptyProduct;
  const deleteCategory = (categoryId: string) => {
    const eraseCategory = listReminders.filter(
      (category) => category.id !== categoryId
    );
    setListReminders(eraseCategory);
  };
  return (
    <main className={`flex w-full justify-center p-4 ${inter.className}`}>
      <div className="flex flex-col w-full md:max-w-3xl py-4">
        <div className="flex items-baseline self-end">
          <div className="pr-6">
            <Button
              className="rounded-full w-4 h-4 bg-pink-500 p-0 hover:bg-pink-600"
              onClick={() => setColor("-pink-500")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-violet-500 p-0 hover:bg-violet-600"
              onClick={() => setColor("-violet-500")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-green-500 p-0 hover:bg-green-600"
              onClick={() => setColor("-green-500")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-cyan-400 p-0 hover:bg-cyan-600"
              onClick={() => setColor("-cyan-400")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-amber-400 p-0 hover:bg-amber-600"
              onClick={() => setColor("-amber-400")}
            />
          </div>
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
        </div>
        <h3 className={`font-bold text${color} text-3xl`}>Groceries</h3>
        <div className="self-end flex flex-col space-y-2 flex-initial">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="link"
                  onClick={() => {
                    setShow(!show);
                  }}
                  className={`underline text${color}`}>
                  {show ? <h3>hide</h3> : <h3>show</h3>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {show ? <h3>hide checked items</h3> : <h3>show all items</h3>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="h-screenH w-full ">
          <div className="flex w-full flex-auto flex-col">
            <div>
              {renderIfShow.map((reminder, index) => {
                const productsToShowOrHide = show
                  ? reminder.products
                  : reminder.products.filter((ele) => !ele.isChecked);
                const isProductEmpy = reminder.products.find(
                  (item) => item.name === ""
                );
                const productEmptyObj = {
                  name: "",
                  id: generateId(15),
                  isChecked: false,
                };
                return (
                  <Accordion
                    key={reminder.id}
                    type="single"
                    defaultValue={reminder.categoryName}
                    collapsible
                    className="w-full">
                    <AccordionItem value={reminder.categoryName}>
                      <motion.div
                        layout
                        key={reminder.id}
                        onDrop={(e) => onDrop(e, reminder.id, index)}
                        onDragOver={onDragOver}>
                        <div className="flex items-center">
                          <Reminders // Category
                            saveCategoryEdited={saveCategoryEdited}
                            category={reminder}
                            deleteCategory={deleteCategory}
                          />
                          <AccordionTrigger color={color} />
                          <Button
                            variant="ghost"
                            onClick={() => deleteCategory(reminder.id)}>
                            x
                          </Button>
                        </div>
                        <AccordionContent>
                          {productsToShowOrHide.map((product) => {
                            return (
                              <div key={product.id}>
                                <motion.div
                                  draggable
                                  onDragStart={(e) =>
                                    onDragStart(e, product.id)
                                  }>
                                  <Product
                                    product={product}
                                    dragControls={dragControls}
                                    color={color}
                                    saveProductEdited={saveProductEdited}
                                    categoryId={reminder.id}
                                    darkMode={darkMode}
                                    setProductToComplete={setProductToComplete}
                                  />
                                </motion.div>
                              </div>
                            );
                          })}
                          {!isProductEmpy && (
                            <Product
                              product={productEmptyObj}
                              dragControls={dragControls}
                              color={color}
                              saveProductEdited={saveProductEdited}
                              categoryId={reminder.id}
                              darkMode={darkMode}
                              setProductToComplete={setProductToComplete}
                            />
                          )}
                        </AccordionContent>
                      </motion.div>
                    </AccordionItem>
                  </Accordion>
                );
              })}
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="primary-input">
              <Input
                className="bg-transparent flex-initial w-full rounded-md p-6 focus:outline-none mt-6"
                value={input}
                type="text"
                id="primary-input"
                name="primary-input"
                placeholder="I would like to buy..."
                onChange={handleInputChange}
              />
            </label>
          </form>
        </div>
      </div>
    </main>
  );
}
