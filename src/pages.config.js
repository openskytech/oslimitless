import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import Team from './pages/Team';
import CEOInbox from './pages/CEOInbox';
import Vault from './pages/Vault';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ProjectDetail": ProjectDetail,
    "Team": Team,
    "CEOInbox": CEOInbox,
    "Vault": Vault,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};