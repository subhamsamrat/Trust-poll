// import { Button, Modal } from "@heroui/react";
// import logo from "../../assets/logo.svg";
// import google from "../../assets/google.png";
// import { useForm, type SubmitHandler } from "react-hook-form";

// type LoginFormInputs = {
//   email: string;
//   password: string;
// };

// export function Login() {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<LoginFormInputs>();

  

//   const onSubmit: SubmitHandler<LoginFormInputs> = (data) => {
//     console.log("Login Form Data:", data);
//   };

//   return (
//     <Modal>
//       <Button variant="secondary" className="bg-[#FF8F00] text-black font-bold">
//         Login
//       </Button>
//       <Modal.Backdrop variant="blur">
//         <Modal.Container>
//           <Modal.Dialog className="sm:max-w-[380px] p-6 bg-white dark:bg-[#262626] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
//             <Modal.CloseTrigger />
//             <Modal.Header className="flex flex-col items-center gap-2 text-center pb-4">
//               <Modal.Icon className="w-auto">
//                 <img src={logo} alt="TrustPoll Logo" className="h-7 w-auto" />
//               </Modal.Icon>
//               <Modal.Heading className="text-xl font-bold text-slate-900 dark:text-white">
//                 Welcome Back
//               </Modal.Heading>
//               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
//                 Sign in to your TrustPoll account
//               </p>
//             </Modal.Header>

//             <Modal.Body>
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     placeholder="name@example.com"
//                     {...register("email", {
//                       required: "Email is required",
//                       pattern: {
//                         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                         message: "Invalid email address",
//                       },
//                     })}
//                     className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-[#4B5563] bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
//                   />
//                   {errors.email && (
//                     <p className="text-xs text-red-500 mt-1">
//                       {errors.email.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     placeholder="••••••••"
//                     {...register("password", {
//                       required: "Password is required",
//                       minLength: {
//                         value: 6,
//                         message: "Password must be at least 6 characters",
//                       },
//                     })}
//                     className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-[#4B5563] bg-slate-50 dark:bg-[#1a1a1a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition"
//                   />
//                   {errors.password && (
//                     <p className="text-xs text-red-500 mt-1">
//                       {errors.password.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="pt-2">
//                   <button
//                     type="submit"
//                     disabled={isSubmitting}
//                     className="w-full py-2.5 bg-[#1a8cff] hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition cursor-pointer text-sm"
//                   >
//                     {isSubmitting ? "Signing in..." : "Login"}
//                   </button>
//                   <button
//                     type="button"
//                     className="w-full py-2.5 flex flex-row items-center justify-center border border-slate-300 dark:border-slate-700 font-bold rounded-xl shadow-sm transition cursor-pointer text-sm mt-2 text-slate-800 dark:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
//                   >
//                     <img src={google} alt="Google" className="w-5 h-5 mr-2" /> Continue with Google
//                   </button>
//                 </div>
//               </form>
//               <div className="mt-5 text-center"><p>Don't have an Account <a href="" className="text-blue-500">SignUp</a></p></div>
//             </Modal.Body>
//           </Modal.Dialog>
//         </Modal.Container>
//       </Modal.Backdrop>
//     </Modal>
//   );
// }