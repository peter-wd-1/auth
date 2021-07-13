import React from "react";
import { motion } from "framer-motion";
import styled from "@emotion/styled/macro";

const motionWrapper = (StyledComponent, motionProps) => (props) => {
    return (
        <StyledComponent {...motionProps} {...props}>
            {props.children}
        </StyledComponent>
    );
};

const StyledFieldSet = styled(motion.fieldset)({
    display: "flex",
    flexDirection: "column",
});
const FieldSet = motionWrapper(StyledFieldSet, {});

export { FieldSet };
