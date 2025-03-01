
import { useParams } from "react-router-dom";
import Dashboard from "./Dashboard";

const ProductLinePage = () => {
  const { productLineId } = useParams<{ productLineId: string }>();
  
  // Render the Dashboard component with the product line ID
  return (
    <Dashboard initialProductLineId={productLineId} />
  );
};

export default ProductLinePage;
