// "use client";
// import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import React from "react";

// function SearchBar() {
//     return (
//         <form
//             className="max-w- mx-auto w-full "
//             onSubmit={(e) => {
//                 e.preventDefault(); // prevent page reload
//                 const query = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
//                 console.log("Searching for:", query); // replace with actual search logic
//             }}
//         >
//             <label
//                 htmlFor="search"
//                 className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
//             >
//                 Search
//             </label>
//             <div className="relative">
//                 {/* Icon */}
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                     <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                 </div>

//                 {/* Input */}
//                 <input
//                     type="search"
//                     id="search"
//                     name="search"
//                     className="block w-full p-4 pl-10 text-sm text-gray-900 border 
//                     border-gray-300 rounded-full bg-gray-50 focus:ring-blue-500 
//                     focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 
//                     dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 
//                     dark:focus:border-blue-500"
//                     placeholder="Search Mockups, Logos..."
//                     required
//                 />


//                 {/* Button */}
//                 <button
//                     type="submit"
//                     className="text-white absolute right-2.5 bottom-2.5 px-4 py-2 bg-violet-400 text-black hover:bg-violet-300 
//                     focus:ring-4 focus:outline-none focus:ring-blue-300 
//                     font-medium rounded-full text-sm px-4 py-2 dark:bg-blue-600 
//                     dark:hover:bg-blue-700 dark:focus:ring-blue-800 hover:text-gray hover:border h"
//                 >
//                     Search
//                 </button>

//             </div>
//         </form>
//     );
// }

// export default SearchBar;
