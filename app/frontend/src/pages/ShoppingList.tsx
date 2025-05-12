import React, { useState, useEffect } from 'react';
import { useMealPlan } from '../contexts/MealPlanContext';
import { Check, Download, ShoppingBag } from 'lucide-react';

const ShoppingList: React.FC = () => {
  const { getShoppingList } = useMealPlan();
  const [shoppingList, setShoppingList] = useState<{ name: string; quantity: number; unit: string }[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShoppingList = async () => {
      setIsLoading(true);
      try {
        const list = await getShoppingList();
        setShoppingList(list);
      } catch (error) {
        console.error('Failed to fetch shopping list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShoppingList();
  }, [getShoppingList]);

  const handleCheckItem = (itemName: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const handleExportCSV = () => {
    const headers = 'Item,Quantity,Unit\n';
    const rows = shoppingList
      .map((item) => `"${item.name}","${item.quantity}","${item.unit}"`)
      .join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'shopping_list.csv');
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  const groupedItems = shoppingList.reduce(
    (groups: Record<string, typeof shoppingList>, item: { name: string; quantity: number; unit: string }) => {
      const firstLetter = item.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(item);
      return groups;
    },
    {}
  );

  const groupLetters = Object.keys(groupedItems).sort();
  const totalItems = shoppingList.length;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercentage = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-green-600 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" />
                Shopping List
              </h1>

              {shoppingList.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="bg-white text-green-600 hover:bg-green-50 px-3 py-1 rounded-md text-sm font-medium flex items-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </button>
              )}
            </div>

            {shoppingList.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>
                    {checkedCount} of {totalItems} items
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div
                    className="bg-white h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            {shoppingList.length > 0 ? (
              <div>
                {groupLetters.map((letter) => (
                  <div key={letter} className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-800 mr-2">
                        {letter}
                      </span>
                    </h2>
                    <ul className="space-y-2">
                      {groupedItems[letter].map(
                        (item: { name: string; quantity: number; unit: string }, index: number) => (
                          <li key={index} className="flex items-center">
                            <button
                              onClick={() => handleCheckItem(item.name)}
                              className={`h-5 w-5 rounded border flex-shrink-0 mr-3 ${
                                checkedItems[item.name]
                                  ? 'bg-green-600 border-green-600 flex items-center justify-center'
                                  : 'border-gray-300'
                              }`}
                            >
                              {checkedItems[item.name] && <Check className="h-3 w-3 text-white" />}
                            </button>
                            <span
                              className={
                                checkedItems[item.name] ? 'line-through text-gray-400' : 'text-gray-800'
                              }
                            >
                              <span className="font-medium">
                                {item.quantity} {item.unit}
                              </span>{' '}
                              {item.name}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your shopping list is empty</h2>
                <p className="text-gray-600 mb-4">
                  Add recipes to your meal plan to generate a shopping list
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;