import { Box, IconButton, useMediaQuery } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ArrowLeftOutlinedIcon from "@mui/icons-material/ArrowLeftOutlined";
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";

export const LOLOFooterComponent = ({ ...props }) => {
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const { ui } = useSelector((state) => state);
  const scrollContainerRef = useRef(null);
  const [isScrolledToLeftEnd, setIsScrolledToLeftEnd] = useState(true);
  const [isScrolledToEndRight, setIsScrolledToEndRight] = useState(false);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= 200; // Adjust scroll distance as needed
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += 200; // Adjust scroll distance as needed
    }
  };

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsScrolledToEndRight(el.scrollWidth > el.clientWidth + el.scrollLeft);
  };

  useEffect(() => {
    const element = scrollContainerRef.current;
    checkScroll();
    if (element) {
      const handleScroll = () => {
        setIsScrolledToLeftEnd(element.scrollLeft === 0);
        window.requestAnimationFrame(checkScroll);
      };

      element.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", () =>
        window.requestAnimationFrame(checkScroll)
      );
      // Cleanup the event listener when the component unmounts
      return () => {
        window.removeEventListener("resize", () =>
          window.requestAnimationFrame(checkScroll)
        );
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        padding: theme.spacing(1.5),
        display: props.children ? "flex" : "none",
        justifyContent: "space-evenly",
        alignItems: "center",
        position: "fixed",
        bottom: 0,
        left: 0,
        backgroundColor: "#fff",
        zIndex: 99,

        ...(ui.drawerOpen && {
          width: "100%",
          marginLeft: 10,
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
        [theme.breakpoints.down("sm")]: {
          marginLeft: 1,
          width: "100%",
        },
      })}
    >
      <IconButton
        sx={{ visibility: isScrolledToLeftEnd ? "hidden" : "visible" }}
        disabled={isScrolledToLeftEnd}
        onClick={scrollLeft}
      >
        <ArrowLeftOutlinedIcon />
      </IconButton>

      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
        ref={scrollContainerRef}
      >
        {props.children}
      </Box>
      <IconButton
        sx={{ visibility: isScrolledToEndRight ? "visible" : "hidden" }}
        disabled={!isScrolledToEndRight}
        onClick={scrollRight}
      >
        <ArrowRightOutlinedIcon />
      </IconButton>
    </Box>
  );
};
