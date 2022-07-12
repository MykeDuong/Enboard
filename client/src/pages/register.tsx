import React from 'react';
import { Formik, Form } from 'formik';
import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';

import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
    return (
        <Wrapper>
            <Formik 
                initialValues={{ username: '', password: ''}}
                onSubmit={(values) => console.log(values)}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name='username'
                            placeholder='Username'
                            label='Username'
                        />
                        <Box mt={4}>
                            <InputField
                                name='password'
                                placeholder='Password'
                                label='Password'
                                type="password"
                            />
                        </Box>
                        <Button mt={4} isLoading={isSubmitting} type='submit' colorScheme="teal">Register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}
export default Register