import { Link } from "react-router-dom";
import hamburger from "../assets/icons/hamburger.svg";
import { useState } from "react";
import { navlinks } from "../constants/index.js";

// eslint-disable-next-line react/prop-types
function Nav({ page }) {
  const [hamburgerClasses, setHamburgerClasses] = useState("hidden");
  function showHamburger() {
    if (hamburgerClasses === "hidden") {
      setHamburgerClasses(
        "p-4 mt-4 rounded-2xl w-fit float-right md:hidden border border-black rounded-md w-fit px-4 py-2",
      );
    } else {
      setHamburgerClasses("hidden");
    }
  }
  return (
    <header className="py-6 z-10 w-full px-4">
      <nav className="flex justify-between items-center mx-auto">
        <div className="ml-5 cursor-pointer">
          <Link to="/">
            <div className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
             <img src="./src/assets/icons/person-reading-a-book-question-mark-svgrepo-com.svg" />
              <span className="ml-3 text-xl">SpeechEase</span>
            </div>
          </Link>
        </div>
        <ul
          className="flex gap-16 text-xl font-sans max-md:hidden"
          id="nav-items"
        >
          {navlinks.map((obj) => {
            if (obj.pageName === page) {
              return obj.links.map((obj, index) => {
                if (obj.link[0] === "#") {
                  return (
                    <li key={index} className="cursor-pointer">
                      <a href={obj.link}>{obj.title}</a>
                    </li>
                  );
                } else {
                  return (
                    <li key={index} className="cursor-pointer">
                      <Link to={obj.link}>{obj.title}</Link>
                    </li>
                  );
                }
              });
            }
          })}
        </ul>
        <div className="flex gap-5 mr-5 max-md:hidden text-xl cursor-pointer">
        {page === "home" && <Link to="/dashboard" className="underline font-bold">Get Started</Link>}
        </div>
        <div className="hidden max-md:block">
          <button aria-controls="nav-items" aria-expanded="false">
            <img
              src={hamburger}
              alt="hamburger"
              width={40}
              onClick={() => showHamburger()}
            />
          </button>
        </div>
      </nav>
      <div className={hamburgerClasses}>
        <ul className="text-xl font-sans text-right">
          {navlinks.map((obj) => {
            if (obj.pageName === page) {
              return obj.links.map((obj, index) => (
                <li key={index} className="cursor-pointer py-1">
                  <a href={obj.link}>{obj.title}</a>
                </li>
              ));
            }
          })}
          
          <li className="cursor-pointer">
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Nav;