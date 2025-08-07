
import React, { use } from 'react'
import { useState , useContext,useEffect,useRef} from 'react'
import axios from 'axios'
import { AppContext } from '../App'
import { useNavigate, useLocation  } from 'react-router-dom'
import { Button, Form, Container} from 'react-bootstrap'


export const Login = () => {

    const {jwt, setJwt, user, setUser} = useContext(AppContext);
    const navigate = useNavigate();
  
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const [isErrorHidden,setIsErrorHidden]=useState(true)
    const [validate,setValidate] = useState(false);
    const [errorMessage,setErrorMessage]=useState("");


    const handleSubmit = async (e) => {
      e.preventDefault();
        
      if(!e.currentTarget.checkValidity()){
          setValidate(true);    
          console.log("hello, e.currentTarget.checkValidity() is false")
        }else{
            setIsErrorHidden(true);
            setErrorMessage("");
            try {
                const response = await axios.post(
                    'http://localhost:8080/login',
                    { 
                        username: username,
                        password: password
                    },
                    {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                    }
                );
                setJwt(response.data.token)
                console.log("jwt : "+response.data.token)
                const user = await axios.post("http://localhost:8080/user/byjwt",
                    {token : response.data.token},
                    { headers : { Authorization : `Bearer ${response.data.token}` } }
                );
                setUser(user.data)
                localStorage.setItem('user', JSON.stringify(user.data));
                localStorage.setItem('jwt',response.data.token)
                navigate('/dashboard')
            } catch (error) {
                console.error('Error:', error);
                if (error.status ==401){
                    setIsErrorHidden(false);
                    setErrorMessage("Invalid password or username");
                }
            }
        }
        };

    return (
    <div
  style={{
    backgroundColor: '#e9ecf0',
    width: '100vw',       // ← full viewport width
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',  // now *also* center horizontally
    alignItems: 'center',
  }}
>
  <Container
    className="bg-white rounded shadow p-4"
    style={{ width: '100%', maxWidth: '400px' }}
  >
    <h1 className="mb-4 text-center text-primary">Login</h1>

    <Form onSubmit={handleSubmit} noValidate validated={validate}>
      <Form.Group className="mb-3">
        <Form.Control
        required
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
        />
      <Form.Control.Feedback type="invalid">Please provide a username</Form.Control.Feedback>
      </Form.Group>


      
      <Form.Group className="mb-3">
        <Form.Control
        required
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
        />
<Form.Control.Feedback type="invalid">Please provide a password</Form.Control.Feedback>
      </Form.Group>

      {!isErrorHidden && <p className="text-center" style={{color:'red'}}>{errorMessage}</p>}
      <div className="d-grid mb-3">
        <Button variant="primary" type='submit'>
          Login
        </Button>
      </div>

      <div className="text-center">
        <small className="me-2">Don't have an account?</small>
        <Button variant="outline-primary" size="sm" onClick={() => navigate('/register')}>
          Create an account
        </Button>
      </div>
    </Form>
  </Container>
</div>
  )
}
