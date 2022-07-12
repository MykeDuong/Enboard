import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = {
    label: string;
    placeholder: string;
    name: string;
}

const InputField: React.FC<InputFieldProps> = (props) => {
    const [field, { error }] = useField(props.name);

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
            <Input {...field} {...props} id={field.name} placeholder={props.placeholder}/>
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    )
}
export default InputField