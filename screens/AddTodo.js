import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import { addTodoReducer } from "../redux/todoSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

export default function AddTodo() {
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState(new Date());
  const [isToday, setIsToday] = React.useState(false);
  const [withAlert, setWithAlert] = React.useState(false);
  const listTodos = useSelector((state) => state.todos.todos);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const addTodo = async () => {
    const newTodo = {
      id: Math.floor(Math.random() * 1000000),
      text: name,
      hour: isToday
        ? date.toISOString()
        : new Date(date).getTime() + 24 * 60 * 60 * 1000, // 24 hours
      isToday: isToday,
      isCompleted: false,
    };
    try {
      await AsyncStorage.setItem(
        "@Todos",
        JSON.stringify([...listTodos, newTodo])
      );
      dispatch(addTodoReducer(newTodo));
      console.log("Todo save correctly");
      if (withAlert) {
        await scheduleTodoNotification(newTodo);
      }
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  const scheduleTodoNotification = async (todo) => {
    const trigger = new Date(todo.hour);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "It's time",
          body: todo.text,
        },
        trigger,
      });
      console.log("notification was schedule");
    } catch (error) {
      alert("The notification failed to schedule, make sure the hour is valid");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Task</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputTitle}>Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Task"
          placeholderTextColor="#00000030"
          onChangeText={(text) => {
            setName(text);
          }}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputTitle}>Hour</Text>
        <DateTimePicker
          value={date}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedDate) => setDate(selectedDate)}
          style={{ width: "80%" }}
        />
      </View>
      <View style={styles.inputContainer}>
        <View>
          <Text style={styles.inputTitle}>Today</Text>
          <Text
            style={{
              color: "#00000040",
              fontSize: 12,
              maxWidth: "85%",
            }}
          >
            If you disable, the task will be considered as tomorrow
          </Text>
        </View>
        <Switch
          value={isToday}
          onValueChange={(value) => {
            setIsToday(value);
          }}
        />
      </View>
      <View style={[styles.inputContainer, { alignItems: "center" }]}>
        <View>
          <Text style={styles.inputTitle}>Alert</Text>
          <Text
            style={{
              color: "#00000040",
              fontSize: 12,
              maxWidth: "85%",
            }}
          >
            You will receive an alaert at the time you set for this reminder
          </Text>
        </View>
        <Switch
          value={withAlert}
          onValueChange={(value) => {
            setWithAlert(value);
          }}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={addTodo}>
        <Text style={{ color: "white" }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 10,
  },
  inputTitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
  textInput: {
    borderBottomColor: "#00000030",
    borderBottomWidth: 1,
    width: "80%",
  },
  inputContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    paddingBottom: 30,
  },
  button: {
    marginTop: 30,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    height: 46,
    borderRadius: 11,
  },
});
