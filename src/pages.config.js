import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import TaskList from './pages/TaskList';
import Vault from './pages/Vault';
import ProjectAnalytics from './pages/ProjectAnalytics';
import CEOInbox from './pages/CEOInbox';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ProjectDetail": ProjectDetail,
    "TaskList": TaskList,
    "Vault": Vault,
    "ProjectAnalytics": ProjectAnalytics,
    "CEOInbox": CEOInbox,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};