import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { HomePage } from "./pages/HomePage";
import { GuestLayout } from "./components/GuestLayout";
import { AdminLayout } from "./components/AdminLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminOpeningHoursPage } from "./pages/AdminOpeningHoursPage/AdminOpeningHoursPage";
import { AdminProceduresPage } from "./pages/AdminProceduresPage/AdminProceduresPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
	{
		element: <GuestLayout />,
		children: [
			{
				path: "/",
				element: <HomePage />,
			},
		],
	},
	{
		path: "/admin",
		element: <AdminLayout />,
		children: [
			{
				path: "opening-hours",
				element: <AdminOpeningHoursPage />,
			},
			{
				path: "procedures",
				element: <AdminProceduresPage />,
			},
		],
	},
]);

export const App = () => {
	return (
		<SnackbarProvider>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		</SnackbarProvider>
	);
};
