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
import { Title } from "@/Components/UI/title";
import { Separator } from "@radix-ui/react-separator";

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
  const [color, setColor] = useState<
    "pink" | "default" | "violet" | "emerald" | "cyan" | "amber"
  >("pink");
  const [show, setShow] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

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
      if (!isProductEmpy) {
        categoryObj.products.push({
          id: generateId(16),
          name: "",
          isChecked: false,
        });
      }

      // AccordionValue
      const productObj = categoryObj.products.find(
        (item) => item.name === product
      );
      if (productObj) {
        setAccordionValue((prev) => [...prev, category]);
      } else {
        setAccordionValue((prev) => [...prev]);
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
      setAccordionValue((prev) => [...prev, category]);
    }
    const sortCategories = categoriesCopy.map((item) => ({
      ...item,
      products: item.products.slice().sort((a, b) => {
        if (a.name === "" && b.name !== "") return 1;
        if (a.name !== "" && b.name === "") return -1;
        return 0;
      }),
    }));
    setListReminders(sortCategories);
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
        const productEmpty = categoryObj.products.find(
          (item) => item.name === ""
        );
        if (!productEmpty) {
          categoryObj.products.push({
            id: generateId(15),
            name: "",
            isChecked: false,
          });
        }
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
      setAccordionValue((prev) => [...prev, objCategoryToEdit.categoryEdited]);
    }

    setListReminders(listReminderCopy);
  };

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

  const filterCheckedAndEmptyProduct = listReminders.filter((category) => {
    let nonEmptyProducts = category.products.filter(
      (product) => product.name !== ""
    );
    return (
      nonEmptyProducts.some((product) => !product.isChecked) ||
      nonEmptyProducts.length === 0
    );
  });

  const renderIfShow = show
    ? listReminders.filter((item) =>
        item.products.some((ele) => ele.name !== "")
      )
    : filterCheckedAndEmptyProduct.filter((item) =>
        item.products.some((ele) => ele.name !== "")
      );

  const deleteCategory = (categoryId: string) => {
    const eraseCategory = listReminders.filter(
      (category) => category.id !== categoryId
    );
    setListReminders(eraseCategory);
  };

  const filterAccordionValue = accordionValue.filter((value) =>
    listReminders.some((reminder) => reminder.categoryName === value)
  );

  const chekedAmount = listReminders.reduce(
    (a, b) => a + b.products.filter((elem) => elem.isChecked).length,
    0
  );

  return (
    <main className={`flex w-full justify-center p-4 mb-12 ${inter.className}`}>
      <div className="flex flex-col w-full md:max-w-3xl py-4">
        <div className="flex items-center self-end">
          <div className="pr-2 my-0 pb-0">
            <Button
              className="rounded-full w-4 h-4 bg-pinkCust p-0 mx-1 my-0 hover:bg-pink-600"
              onClick={() => setColor("pink")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-cyanCust p-0 mx-1 hover:bg-cyan-600"
              onClick={() => setColor("cyan")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-violetCust p-0 mx-1 hover:bg-violet-600"
              onClick={() => setColor("violet")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-amberCust p-0 mx-1 hover:bg-amber-600"
              onClick={() => setColor("amber")}
            />
            <Button
              className="rounded-full w-4 h-4 bg-emeraldCust p-0 mx-1 hover:bg-emerald-600"
              onClick={() => setColor("emerald")}
            />
          </div>
          {!darkMode && (
            <Button
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
              size="icon"
              onClick={() => {
                setTheme("dark");
                setDarkMode(false);
              }}>
              <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}
        </div>
        <Title variant={color}>Groceries</Title>
        <div className="self-end flex flex-col space-y-2 flex-initial w-full">
          <div className="flex items-center justify-between my-2">
            <h3 className="text-sm">{chekedAmount} Checked</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={color}
                    onClick={() => {
                      setShow(!show);
                    }}>
                    {show ? <h3>hide</h3> : <h3>show</h3>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {show ? <h3>hide checked items</h3> : <h3>show all items</h3>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator className="border-[0.5px]" />
        </div>
        <div className="h-screenH w-full ">
          <div className="flex w-full flex-auto flex-col">
            <Accordion
              type="multiple"
              value={filterAccordionValue}
              onValueChange={(e) => {
                setAccordionValue(e);
              }}
              className="w-full">
              {renderIfShow.map((reminder, index) => {
                const productsToShowOrHide = show
                  ? reminder.products
                  : reminder.products.filter((ele) => !ele.isChecked);
                return (
                  <AccordionItem
                    key={reminder.id}
                    value={reminder.categoryName}>
                    <motion.div
                      layout
                      drag="y"
                      key={reminder.id}
                      onDrop={(e) => onDrop(e, reminder.id, index)}
                      onDragOver={onDragOver}>
                      <div className="flex items-center">
                        <Reminders // Category
                          saveCategoryEdited={saveCategoryEdited}
                          category={reminder}
                          color={color}
                        />
                        <AccordionTrigger variant={color} />
                        <Button
                          variant={color}
                          className="text-base"
                          onClick={() => {
                            deleteCategory(reminder.id);
                          }}>
                          x
                        </Button>
                      </div>
                      <AccordionContent style={{ margin: "20px 0px" }}>
                        {productsToShowOrHide.map((product) => {
                          return (
                            <motion.div
                              draggable
                              key={product.id}
                              onDragStart={(e) => onDragStart(e, product.id)}>
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
                          );
                        })}
                      </AccordionContent>
                    </motion.div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="primary-input">
              <Input
                className="bg-transparent flex-initial w-full rounded-md p-6 border mt-6"
                value={input}
                variant={color}
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
