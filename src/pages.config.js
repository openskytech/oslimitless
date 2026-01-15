import CEOInbox from './pages/CEOInbox';
import Home from './pages/Home';
import ProjectAnalytics from './pages/ProjectAnalytics';
import ProjectDetail from './pages/ProjectDetail';
import TaskList from './pages/TaskList';
import Vault from './pages/Vault';
import Settings from './pages/Settings';
import Team from './pages/Team';
import BusinessFinances from './pages/BusinessFinances';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CEOInbox": CEOInbox,
    "Home": Home,
    "ProjectAnalytics": ProjectAnalytics,
    "ProjectDetail": ProjectDetail,
    "TaskList": TaskList,
    "Vault": Vault,
    "Settings": Settings,
    "Team": Team,
    "BusinessFinances": BusinessFinances,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};