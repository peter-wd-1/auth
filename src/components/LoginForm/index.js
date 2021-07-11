import React, { useReducer, useState } from "react";
import { InputFeild } from "components";
// form 컴포넌트의 액션. 실재 상태를 조작하는 로직의 이름 인덱스 정도로 보면됨.
const actionTypes = {
    submitForm: "submitForm",
    changeInputValues: "changeInputValues",
};
/**
 * 액션 로직을 실행서 상태를 조작하는 reducer들을 정의한다.
 * TODO: 리듀서를 합치는 방식의 정의 두가지가 있어 보임
 * @function combineReducer 하나는 원하는 로직의경우 반환하는 방식
 * @function composeReducer 하나는 배열의 reducer를 이용한 함수를 합치는 방법.
 */
function loginFormReducer(state, action) {
    switch (action.type) {
        case actionTypes.changeInputValues: {
            return {
                ...state,
                ...action.values,
            };
        }
        case actionTypes.submitForm: {
            return 0;
        }
        default: {
            throw new Error(`Unhandled type in formReducer: ${action.type}`);
        }
    }
}

/**
 * Form의 상태 업데이트 로직을 사용하는 API.
 * 각 액션에 해당하는 로직을 실행하는 훅을 반환.
 */
function useLoginForm({ reducer = loginFormReducer } = {}) {
    const [state, dispatch] = useReducer(reducer, []);
    const changeInputValues = (values) => {
        dispatch({ type: actionTypes.changeInputValues, values });
    };

    const submitForm = () => {
        dispatch({ type: actionTypes.submitForm });
    };

    return { state, changeInputValues, submitForm };
}

function combineReducers(...reducers) {
    return (state, action) => {
        for (const reducer of reducers) {
            const result = reducer(state, action);
            if (result) return result;
        }
        // TODO: null 값바꾸기
        return null;
    };
}

function composereducers(...reducers) {
    return reducers.reduce((prereducer, nextreducer) => (state, action) =>
        nextreducer(prereducer(state, action))
    );
}

const items = [
    {
        type: "tel",
        name: "phone",
        label: "Phone Number",
    },
    {
        type: "password",
        name: "password",
        label: "Password",
    },
];

//
function LoginForm({ reducer = () => {}, ...props }) {
    const { state, changeInputValues, submitForm } = useLoginForm({
        reducer: combineReducers(reducer, loginFormReducer),
    });
    return (
        <div>
            <InputFeild
                items={items}
                reducer={({ state }) => {
                    changeInputValues(state);
                    return state;
                }}
            />
            {JSON.stringify(state)}
        </div>
    );
}

export { LoginForm };