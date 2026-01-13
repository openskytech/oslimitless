import CEOInbox from './pages/CEOInbox';
import Finances from './pages/Finances';
import ProjectAnalytics from './pages/ProjectAnalytics';
import ProjectDetail from './pages/ProjectDetail';
import Settings from './pages/Settings';
import TaskList from './pages/TaskList';
import Team from './pages/Team';
import Vault from './pages/Vault';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CEOInbox": CEOInbox,
    "Finances": Finances,
    "ProjectAnalytics": ProjectAnalytics,
    "ProjectDetail": ProjectDetail,
    "Settings": Settings,
    "TaskList": TaskList,
    "Team": Team,
    "Vault": Vault,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};