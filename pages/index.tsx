import { useCompletion } from "ai/react";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import Reminders from "@/Components/Reminders";
import { Button } from "@/Components/UI/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { Input } from "@/Components/UI/input";
import {
  DragDropContext,
  Draggable,
  DraggableLocation,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";

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
import { Separator } from "@/Components/UI/separator";
import { Skeleton } from "@/Components/UI/skeleton";
import Product from "@/Components/Product";

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

function dec2num(dec: number) {
  return (dec % 10).toString();
}

function generateId(len: number) {
  var arr = new Uint8Array((len || 20) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2num).join("");
}

export default function Home() {
  const [listReminders, setListReminders] = useState<IReminder[]>([]);
  const [color, setColor] = useState<
    "pink" | "default" | "violet" | "emerald" | "cyan" | "amber"
  >("pink");
  const [show, setShow] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const [inputCustom, setInputCustom] = useState<string>("");

  const { setTheme } = useTheme();

  // HandleSubmit for Vercel SDK
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

  // Vercel SDK
  const { handleSubmit, isLoading, setInput } = useCompletion({
    api: "/api/completion",
    onFinish: (product, categories) => {
      setInputCustom("");
      handleReminders(inputCustom, categories);
    },
  });

  const setProductToComplete = (productCategoryIds: ISetProductToComplete) => {
    const listCopy = [...listReminders];
    const categoryObj = listCopy.find(
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

    setListReminders(listCopy);
  };

  const saveProductEdited = (objProductEdited: ISaveProductEdited) => {
    const listCopy = [...listReminders];
    const categoryObj = listCopy.find(
      (obj) => obj.id === objProductEdited.categoryId
    );

    if (categoryObj) {
      const productObj = categoryObj.products.find(
        (product) => product.id === objProductEdited.productId
      );

      if (productObj) {
        const productIndex = categoryObj.products.findIndex(
          (product) => product.id === objProductEdited.productId
        );
        if (objProductEdited.productEdited === "" && productObj.name !== "") {
          if (productIndex !== -1) {
            categoryObj.products.splice(productIndex, 1);
          }
        }
        productObj.name = objProductEdited.productEdited;

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
      }
    }
    setListReminders(listCopy);
    setInputCustom("");
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    let updatedListReminders = [...listReminders];

    if (source.droppableId === destination.droppableId) {
      updatedListReminders = reorderProductsWithinCategory(
        updatedListReminders,
        source,
        destination
      );
    } else {
      updatedListReminders = moveProductBetweenCategories(
        updatedListReminders,
        source,
        destination
      );
    }

    setListReminders(updatedListReminders);
  };

  const reorderProductsWithinCategory = (
    list: IReminder[],
    source: DraggableLocation,
    destination: DraggableLocation
  ) => {
    const category = list.find((cat) => cat.id === source.droppableId);
    if (category) {
      const [removedProduct] = category.products.splice(source.index, 1);
      category.products.splice(destination.index, 0, removedProduct);
    }
    return list;
  };

  const moveProductBetweenCategories = (
    list: IReminder[],
    source: DraggableLocation,
    destination: DraggableLocation
  ) => {
    const sourceCategory = list.find((cat) => cat.id === source.droppableId);
    if (sourceCategory) {
      const destinationCategory = list.find(
        (cat) => cat.id === destination.droppableId
      );

      const [product] = sourceCategory.products.splice(source.index, 1);
      destinationCategory?.products.splice(destination.index, 0, product);
    }

    return list;
  };

  const filterCheckedAndEmptyProduct = listReminders.filter((category) => {
    let nonEmptyProducts = category.products.filter(
      (product) => product.name !== ""
    );
    return nonEmptyProducts.some((product) => !product.isChecked);
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

  const handleChangeCustom = (e: any) => {
    setInputCustom(e.target.value);
    const categoriesAndProducts = listReminders.map((item) => {
      return { category: item.categoryName };
    });
    const categories = [
      { ...categoriesAndProducts, user_input: e.target.value },
    ];
    const objCategories = JSON.stringify(categories);

    setInput(objCategories);
  };
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
        <div className="w-full ">
          <div className="flex w-full flex-auto flex-col">
            <DragDropContext
              onDragEnd={(result) => {
                onDragEnd(result);
              }}>
              <Accordion
                type="multiple"
                value={filterAccordionValue}
                onValueChange={(e) => {
                  setAccordionValue(e);
                }}
                className="w-full">
                {renderIfShow.map((reminder) => {
                  const productsToShowOrHide = show
                    ? reminder.products
                    : reminder.products.filter((ele) => !ele.isChecked);
                  return (
                    <AccordionItem
                      key={reminder.id}
                      value={reminder.categoryName}>
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
                      <AccordionContent className="my-5 w-full">
                        <Droppable droppableId={reminder.id}>
                          {(droppableProvider) => (
                            <div
                              className="w-full"
                              ref={droppableProvider.innerRef}
                              {...droppableProvider.droppableProps}>
                              {productsToShowOrHide.map((product, index) => {
                                return (
                                  <Draggable
                                    key={product.id}
                                    draggableId={product.id}
                                    index={index}>
                                    {(draggableProvider) => (
                                      <div
                                        key={product.id}
                                        ref={draggableProvider.innerRef}
                                        {...draggableProvider.draggableProps}
                                        {...draggableProvider.dragHandleProps}>
                                        <Product
                                          product={product}
                                          key={product.id}
                                          color={color}
                                          saveProductEdited={saveProductEdited}
                                          categoryId={reminder.id}
                                          setProductToComplete={
                                            setProductToComplete
                                          }
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {droppableProvider.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </DragDropContext>
          </div>
          {isLoading && (
            <div className="space-y-2 my-6">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-8 w-[95%]" />
              <Skeleton className="h-8 w-[95%]" />
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label htmlFor="primary-input">
              <Input
                className="bg-transparent flex-initial w-full rounded-md p-6 border mt-6"
                value={inputCustom}
                variant={color}
                type="text"
                id="primary-input"
                name="primary-input"
                placeholder="I would like to buy..."
                onChange={(e) => handleChangeCustom(e)}
              />
            </label>
          </form>
        </div>
      </div>
    </main>
  );
}
