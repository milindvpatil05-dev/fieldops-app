import { useLocalSearchParams } from "expo-router";
import CreateWorkOrderScreen from "../../../screens/CreateWorkOrderScreen";

export default function EditWorkOrderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CreateWorkOrderScreen mode="edit" id={id} />;
}
