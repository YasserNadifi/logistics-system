import axios from 'axios';
import React, { useState } from 'react'
import { Form , Button , Container} from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {

    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [firstName,setFirstName] = useState("");
    const [lastName,setLastName] = useState("");
    const [errorMessage,setErrorMessage]=useState("");
    const [errorVisible,setErrorVisible]=useState(false);
    const [validate,setValidate] = useState(false);
    const [isUsernameUnique,setIsUsernameUnique]=useState(true);
    const [touched,setTouched]=useState({
        username:false,
        password:false,
        firstname:false,
        lastname:false
    });

    const handleTouched = (fieldName) =>{
        setTouched({...touched,[fieldName]:true})
    }

    const navigate = useNavigate();

    const handleSubmit = async (e)=>{
        e.preventDefault();
        
        if(!e.currentTarget.checkValidity()){
            setValidate(true);    
            console.log("hello, e.currentTarget.checkValidity() is false")
        } else {
            setValidate(false);
            setIsUsernameUnique(true);    
            const data={
                username:username,
                password:password,
                firstName:firstName,
                lastName:lastName,
                role:"USER"
            }
            try{
                const response = await axios.post("http://localhost:8080/register",data,
                    {
                        headers:{
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(response.data);
                localStorage.setItem("jwt",response.data.token);
                navigate(`/notes`)
            } catch(err){
                if(err.response.data.message=="username already taken"){
                    console.log("username already taken");
                    setIsUsernameUnique(false);
                }
            }
        }
    }

  return (
<div
  style={{
    backgroundColor: '#e9ecf0',
    minHeight: '100vh',
    width:'100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <Container
    className="bg-white rounded shadow p-4"
    style={{ width: '100%', maxWidth: '500px' }}
  >
    <Form className="mt-2" noValidate validated={validate} onSubmit={handleSubmit}>
      <h1 className="mb-4 text-center text-primary">Create an account</h1>

      <Form.Group className="mb-3">
        <Form.Label>Username</Form.Label>
        <Form.Control
          required
          onBlur={() => handleTouched('username')}
          isInvalid={touched.username && (!username || !isUsernameUnique)}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">
          {!isUsernameUnique && 'Username already taken'}
          {!username && 'Please provide a username'}
        </Form.Control.Feedback>
        <Form.Text muted>Each user has a unique username</Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <Form.Control
          required
          onBlur={() => handleTouched('password')}
          isInvalid={touched.password && !password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Form.Control.Feedback type="invalid">Please provide a password</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>First Name</Form.Label>
        <Form.Control isInvalid={false} onChange={(e) => setFirstName(e.target.value)} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Last Name</Form.Label>
        <Form.Control isInvalid={false} onChange={(e) => setLastName(e.target.value)} />
      </Form.Group>

      <div className="d-grid mb-3">
        <Button variant="primary" type="submit">
          Create an account
        </Button>
      </div>
            <div className="text-center">
              <small className="me-2">Already have an account?</small>
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
            </div>
    </Form>
  </Container>
</div>

  )
}