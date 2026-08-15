import { Link } from "react-router";
import { useState } from "react";
import { navlinks } from "../constant/index.js";
import { useAuth } from "../context/AuthContext";

function Nav({ page }) {
  const [hamburgerClasses, setHamburgerClasses] = useState("hidden");
  const { isAuthenticated, user, logout } = useAuth();

  function showHamburger() {
    setHamburgerClasses((prev) =>
      prev === "hidden"
        ? "p-4 mt-4 rounded-2xl w-fit float-right md:hidden border border-black rounded-md w-fit px-4 py-2"
        : "hidden"
    );
  }

  const activeGroup = navlinks.find((group) => group.pageName === page);

  const renderLink = (obj, index) =>
    obj.link[0] === "#" ? (
      <li key={index} className="cursor-pointer">
        <a href={obj.link}>{obj.title}</a>
      </li>
    ) : (
      <li key={index} className="cursor-pointer">
        <Link to={obj.link}>{obj.title}</Link>
      </li>
    );

  return (
    <header className="py-6 z-10 w-full px-4">
      <nav className="flex justify-between items-center mx-auto">
        <div className="ml-5 cursor-pointer">
          <Link to="/">
            <div className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
              <img src="/icons/person-reading-a-book-question-mark-svgrepo-com.svg" alt="" />
              <span className="ml-3 text-xl">SpeechEase</span>
            </div>
          </Link>
        </div>

        <ul className="flex gap-16 text-xl font-sans max-md:hidden" id="nav-items">
          {activeGroup ? activeGroup.links.map(renderLink) : null}
        </ul>

        <div className="flex items-center gap-5 mr-5 max-md:hidden text-xl">
          {page === "home" && !isAuthenticated && (
            <Link to="/dashboard" className="underline font-bold">
              Get Started
            </Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="font-semibold text-customBrown">
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-customBrown text-white px-4 py-2 rounded-full font-semibold hover:bg-customBrown2"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={logout} className="font-semibold text-customBrown">
                Log Out
              </button>
            </>
          )}
        </div>

        <div className="hidden max-md:block">
          <button aria-controls="nav-items" aria-expanded="false" onClick={showHamburger}>
            <img src="/icons/hamburger.svg" alt="menu" width={40} />
          </button>
        </div>
      </nav>

      <div className={hamburgerClasses}>
        <ul className="text-xl font-sans text-right">
          {activeGroup
            ? activeGroup.links.map((obj, index) => (
                <li key={index} className="cursor-pointer py-1">
                  {obj.link[0] === "#" ? <a href={obj.link}>{obj.title}</a> : <Link to={obj.link}>{obj.title}</Link>}
                </li>
              ))
            : null}
          {!isAuthenticated ? (
            <>
              <li className="py-1">
                <Link to="/login">Log In</Link>
              </li>
              <li className="py-1">
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          ) : (
            <li className="py-1">
              <button onClick={logout}>Log Out</button>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

export default Nav;