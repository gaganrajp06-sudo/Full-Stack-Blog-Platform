import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function Navbar() {
  const nav = useNavigate();
  const logged = !!localStorage.getItem("token");
  const logout = () => { localStorage.removeItem("token"); nav("/login"); };
  return <nav>
    <Link to="/">Blog</Link>
    <div>
      {logged ? <><Link to="/create">Create Post</Link><button onClick={logout}>Logout</button></>
              : <><Link to="/login">Login</Link><Link to="/register">Register</Link></>}
    </div>
  </nav>;
}

function Home() {
  const [posts, setPosts] = useState([]);
  useState(() => { axios.get(`${API}/posts`).then(r => setPosts(r.data)); });
  return <main><h1>All Posts</h1>{posts.map(p =>
    <article key={p._id}><h2>{p.title}</h2><p>{p.content}</p><small>By {p.author?.name || "Unknown"}</small></article>
  )}</main>;
}

function Login() {
  const nav = useNavigate(); const [form,setForm]=useState({email:"",password:""}); const [err,setErr]=useState("");
  const submit = async e => { e.preventDefault(); try {
    const r=await axios.post(`${API}/auth/login`,form); localStorage.setItem("token",r.data.token); nav("/");
  } catch(e){setErr(e.response?.data?.message || "Login failed");} };
  return <Form title="Login" submit={submit} fields={form} setFields={setForm} error={err}/>;
}

function Register() {
  const nav = useNavigate(); const [form,setForm]=useState({name:"",email:"",password:""}); const [err,setErr]=useState("");
  const submit = async e => { e.preventDefault(); try {
    const r=await axios.post(`${API}/auth/register`,form); localStorage.setItem("token",r.data.token); nav("/");
  } catch(e){setErr(e.response?.data?.message || "Registration failed");} };
  return <Form title="Register" submit={submit} fields={form} setFields={setForm} error={err} register/>;
}

function Form({title,submit,fields,setFields,error,register}) {
  return <main><form onSubmit={submit}><h1>{title}</h1>
    {register && <input placeholder="Name" value={fields.name} onChange={e=>setFields({...fields,name:e.target.value})}/>}
    <input placeholder="Email" type="email" value={fields.email} onChange={e=>setFields({...fields,email:e.target.value})}/>
    <input placeholder="Password" type="password" value={fields.password} onChange={e=>setFields({...fields,password:e.target.value})}/>
    <button>{title}</button>{error && <p className="error">{error}</p>}
  </form></main>;
}

function CreatePost() {
  const nav=useNavigate(); const [f,setF]=useState({title:"",content:""});
  const submit=async e=>{e.preventDefault(); try {
    await axios.post(`${API}/posts`,f,{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}); nav("/");
  } catch(e){alert(e.response?.data?.message||"Create failed");}};
  return <main><form onSubmit={submit}><h1>Create Post</h1>
    <input placeholder="Title" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/>
    <textarea placeholder="Content" rows="10" value={f.content} onChange={e=>setF({...f,content:e.target.value})}/>
    <button>Publish</button></form></main>;
}

export default function App(){return <><Navbar/><Routes>
  <Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/>
  <Route path="/register" element={<Register/>}/><Route path="/create" element={<CreatePost/>}/>
</Routes></>;}