import CEOInbox from './pages/CEOInbox';
import Home from './pages/Home';
import ProjectAnalytics from './pages/ProjectAnalytics';
import ProjectDetail from './pages/ProjectDetail';
import TaskList from './pages/TaskList';
import Vault from './pages/Vault';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Finance from './pages/Finance';
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
    "Finance": Finance,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};