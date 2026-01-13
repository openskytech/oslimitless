import CEOInbox from './pages/CEOInbox';
import ProjectAnalytics from './pages/ProjectAnalytics';
import ProjectDetail from './pages/ProjectDetail';
import TaskList from './pages/TaskList';
import Vault from './pages/Vault';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Team from './pages/Team';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CEOInbox": CEOInbox,
    "ProjectAnalytics": ProjectAnalytics,
    "ProjectDetail": ProjectDetail,
    "TaskList": TaskList,
    "Vault": Vault,
    "Home": Home,
    "Settings": Settings,
    "Team": Team,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};