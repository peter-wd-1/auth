import React, { useEffect, useContext } from "react";
import { SelectorInput } from "components/SelectorInput";
import { countryCode } from "./countryCdoe";
import { ApiContext } from "components/PageContainer/Context";
import {
    actionTypes,
    inputFieldReducer,
    useInputField,
    composeReducers,
} from "./use-InputField";
import {
    Label,
    Input,
    InputContainer,
    PhoneInput,
    InvalidMessage,
} from "./lib";

function phoneValidateReducer({ state, action }) {
    if (action.type === actionTypes.phoneVerified) {
        return {
            state: {
                ...state,
                phoneVerified: true,
            },
            action,
        };
    }
    if (action.type === actionTypes.verifyPhone) {
        const value = action.changeEvent.target.value;
        const name = action.changeEvent.target.name;
        const api = action.api;
        if (value.length == 6) {
            try {
                api({
                    path: `/users/verification_codes/${value}/${state.phone.value}`,
                    parms: {
                        method: "GET",
                    },
                }).then((res) => {
                    if (res.ok) {
                        action.dispatch({ type: actionTypes.phoneVerified });
                    }
                });
            } catch (e) {
                return {
                    state: {
                        ...state,
                        phone: {
                            ...state.phone,
                            isValid: false,
                            phoneVerified: false,
                            message: "Check your code again",
                        },
                    },
                    action,
                };
            }
        }
    }

    if (action.type === actionTypes.sendVerificationCode) {
        const api = action.api;
        try {
            console.log(state.phone.value);
            return {
                state: {
                    ...state,
                    sendVerification: true,
                    isSmsSent: true,
                },
            };
            // api({
            //     path: "/users/verification_codes/",
            //     parms: {
            //         method: "POST",
            //         body: JSON.stringify({
            //             phone: `${state.phone.value}`,
            //         }),
            //     },
            // });
        } catch (e) {
            return {
                state: {
                    ...state,
                    phone: {
                        ...state.phone,
                        isValid: false,
                        message: "Somthing is wrong :(",
                    },
                },
                action,
            };
        }
    }

    if (action.type === actionTypes.changeValue) {
        const value = action.changeEvent.target.value;
        const name = action.changeEvent.target.name;
        const api = action.api;
        api({
            path: `/users/phone/${state.phone.value}`,
            parms: {
                method: "GET",
            },
        }).then((res) => {
            if (res.ok) {
                action.dispatch({
                    type: actionTypes.checkPhoneExist,
                    value: true,
                });
            } else {
                action.dispatch({
                    type: actionTypes.checkPhoneExist,
                    value: false,
                });
            }
        });

        if (value.length > 13 && name === "phone") {
            return {
                state: {
                    [action.changeEvent.target.name]: {
                        ...state[action.changeEvent.target.name],
                        isValid: false,
                        message: "Phone number can not be less then 13 digits",
                    },
                },
                action,
            };
        }

        if (value.length < 11 && name == "phone") {
            return {
                state: {
                    [action.changeEvent.target.name]: {
                        ...state[action.changeEvent.target.name],
                        isValid: false,
                        message: "Phone number must be longer then 10 digits",
                    },
                },
                action,
            };
        }

        return {
            state: {
                [action.changeEvent.target.name]: {
                    ...state[action.changeEvent.target.name],
                    isValid: true,
                    message: "Phone number is valid",
                },
            },
            action,
        };
    }

    return {
        state,
        action,
    };
}

function InputField({ item = {}, reducer = ({ state }) => state, ...props }) {
    const { state, changeValue } = useInputField({
        reducer: composeReducers(inputFieldReducer, reducer),
    });

    useEffect(() => {
        if (state.parentChangeInputValues) state.parentChangeInputValues(state);
    }, [state]);

    return (
        <InputContainer
            style={{
                display: "flex",
                flexDirection: "row",
            }}
        >
            <Label>
                <Input
                    type={item.type}
                    name={item.name}
                    onChange={(event) => {
                        changeValue(event);
                    }}
                />
                {item.label || item.labelTag}
            </Label>
            {/* TODO: validator component */}
        </InputContainer>
    );
}

/**
 * ???????????? ??? ??????????????? ???????????? ?????? ????????? ?????? ???????????? ???????????? ????????? ??????.
 * ????????? ???????????? ??????????????? ?????? ?????????. ????????? ????????? ????????? ??????????????? ??????????????? ?????????.
 * ????????? ?????????????????? ??????????????? ?????????????????? ?????????.
 * ????????? ???????????? ????????? state ??????????????? ????????????.
 */
function PhoneInputField({
    item = [],
    reducer = ({ state }) => state,
    ...props
}) {
    const {
        state,
        changeValue,
        verifyPhone,
        sendVerificationCode,
    } = useInputField({
        reducer: composeReducers(
            inputFieldReducer,
            phoneValidateReducer,
            reducer
        ),
    });

    const api = useContext(ApiContext);
    useEffect(() => {
        if (state.parentChangeInputValues) state.parentChangeInputValues(state);
    }, [state]);

    useEffect(() => {
        if (state.sendVerification)
            api({
                path: "/users/verification_codes/",
                parms: {
                    method: "POST",
                    body: JSON.stringify({
                        phone: `${state.phone.value}`,
                    }),
                },
            });
    }, [state.sendVerification]);
    return (
        <InputContainer>
            <Label>
                <Input
                    type={item.type}
                    name={item.name}
                    onChange={(event) => {
                        changeValue(event, api);
                    }}
                />
                {item.label || item.labelTag}
            </Label>
            {state.phone ? (
                <InvalidMessage isValid={state.phone.isValid}>
                    {state.phone.message}
                </InvalidMessage>
            ) : (
                ""
            )}
            {state.isSmsSent ? (
                state.isPhoneExist ? (
                    ""
                ) : (
                    <Label>
                        verification code
                        <Input
                            type="text"
                            onChange={(event) => {
                                verifyPhone(event, api);
                            }}
                            pattern="[0-9]*"
                        />
                    </Label>
                )
            ) : state.isPhoneExist ? (
                ""
            ) : (
                <div
                    onClick={() => {
                        if (state.phone.isValid) {
                            sendVerificationCode(api);
                        }
                    }}
                >
                    Verify Phone number
                </div>
            )}
        </InputContainer>
    );
}

export { InputField, PhoneInputField };
