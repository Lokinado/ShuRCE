import { Group } from "@mantine/core"
import { NavLink } from "react-router-dom"
import classes from "./css/StyledLink.module.css"

type StyledLinkProps = {
    to: string
    text: string
    Icon?: React.ElementType
}

const StyledLink: React.FunctionComponent<StyledLinkProps> = ({
    to,
    text,
    Icon
}) => {
  return (
    <NavLink 
        to={to}
        className={({ isActive, isPending }) =>
            isPending ? classes.link : isActive ? classes['link-active'] : classes.link
        }
    >
    <Group>
        {(Icon ? <Icon/> : <></>)}{text}
    </Group>
    </NavLink>
  )
}

export default StyledLink;