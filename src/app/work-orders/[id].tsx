import { useLocalSearchParams } from "expo-router";
import WorkOrderDetailsScreen from "../../screens/WorkOrderDetailsScreen";

export default function WorkOrderDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkOrderDetailsScreen id={id} />;
}
