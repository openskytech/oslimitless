import CEOInbox from './pages/CEOInbox';
import Home from './pages/Home';
import ProjectAnalytics from './pages/ProjectAnalytics';
import ProjectDetail from './pages/ProjectDetail';
import TaskList from './pages/TaskList';
import Team from './pages/Team';
import Vault from './pages/Vault';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CEOInbox": CEOInbox,
    "Home": Home,
    "ProjectAnalytics": ProjectAnalytics,
    "ProjectDetail": ProjectDetail,
    "TaskList": TaskList,
    "Team": Team,
    "Vault": Vault,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};