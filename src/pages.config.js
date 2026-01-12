import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ProjectDetail": ProjectDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};