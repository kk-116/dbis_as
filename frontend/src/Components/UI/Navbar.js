import { NavLink } from "react-router-dom";

export const Navbar = ()=>{
    const navLinkStyles = ({isActive}) => {
        return{
            fontWeight: isActive ? 'bold' : 'normal',
            textDecoration: isActive ? 'none' : 'none'
        }
    }
    return(
        <nav className="App-header">
            <NavLink style={navLinkStyles} to='/'>
                Home
            </NavLink>
            <NavLink style={navLinkStyles} to='/instructor'>
                Instructor
            </NavLink>
            <NavLink style={navLinkStyles} to='/home/registration'>
                Registration
            </NavLink>
            <NavLink style={navLinkStyles} to='/course/running'>
                Courses
            </NavLink>
            <NavLink style={navLinkStyles} to='/about'>
                About
            </NavLink>

            <NavLink style={navLinkStyles} to='/Login'>
                Login/out
            </NavLink>
        </nav>
    )



}