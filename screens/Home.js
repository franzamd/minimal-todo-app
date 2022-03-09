import * as React from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import TodoList from "../components/TodoList";
import { todosData } from "../data/todos";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hideCompletedReducer, setTodosReducer } from "../redux/todoSlice";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import moment from "moment";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Home() {
  const todos = useSelector((state) => state.todos.todos);

  // const [localData, setLocalData] = React.useState(
  //   todosData.sort((a, b) => {
  //     return b.isCompleted - a.isCompleted;
  //   })
  // );
  const [isHidden, setIsHidden] = React.useState(false);
  const [expoPushToken, setExpoPushToken] = React.useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  React.useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );
    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem("@Todos");
        if (todos != null) {
          const todosData = JSON.parse(todos);
          const todosDatafiltered = todosData.filter((todo) => {
            return moment(new Date(todo.hour)).isSameOrAfter(moment(), "day");
          });
          if (todosDatafiltered !== null) {
            await AsyncStorage.setItem(
              "@Todos",
              JSON.stringify(todosDatafiltered)
            );
            console.log("We delete some passed todos");
            dispatch(setTodosReducer(todosDatafiltered));
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    getTodos();
  }, []);

  const handleHidePress = async () => {
    if (isHidden) {
      setIsHidden(false);
      const todos = await AsyncStorage.getItem("@Todos");
      if (todos !== null) {
        dispatch(setTodosReducer(JSON.parse(todos)));
      }
      return;
    }
    setIsHidden(true);
    dispatch(hideCompletedReducer());
    //   setIsHidden(false);
    //   setLocalData(
    //     todosData.sort((a, b) => {
    //       return b.isCompleted - a.isCompleted;
    //     })
    //   );
    //   return;
    // }
    // setIsHidden(!isHidden);
    // setLocalData(localData.filter((todo) => !todo.isCompleted));
  };

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      return;
    }
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#ff231f7c",
      });
    }
    return token;
  };

  const todayTodos = todos.filter((todo) =>
    moment(todo.hour).isSame(moment(), "day")
  );
  const tomorrowTodos = todos.filter((todo) =>
    moment(todo.hour).isAfter(moment(), "day")
  );

  return todos.length > 0 ? (
    <ScrollView style={styles.container}>
      {/* <Image
        source={{
          uri: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/cute-photos-of-cats-cleaning-1593202999.jpg",
        }}
        style={styles.pic}
      /> */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.title}>Today</Text>
        <TouchableOpacity onPress={handleHidePress}>
          <Text style={{ color: "#3478f6" }}>
            {isHidden ? "Show Completed" : "Hide Completed"}
          </Text>
        </TouchableOpacity>
      </View>

      {todayTodos.left > 0 ? (
        <TodoList
          todosData={todos.filter((todo) =>
            moment(new Date(todo.hour)).isSame(moment(), "day")
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Image
            source={require("../assets/nothingTomorrow.png")}
            style={{
              width: 150,
              height: 150,
              marginBottom: 20,
              resizeMode: "contain",
            }}
          />
          <Text
            style={{
              fontSize: 13,
              color: "#000",
              fontWeight: "bold",
            }}
          >
            CONGRATS!
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#737373",
              fontWeight: "500",
            }}
          >
            You don't have any task, enjoy your day
          </Text>
        </View>
      )}

      <Text style={styles.title}>Tomorrow</Text>

      {tomorrowTodos.length > 0 ? (
        <TodoList
          todosData={todos.filter((todo) =>
            moment(new Date(todo.hour)).isAfter(moment(), "day")
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Image
            source={require("../assets/nothingToday.png")}
            style={{
              width: 150,
              height: 150,
              marginBottom: 20,
              resizeMode: "contain",
            }}
          />
          <Text
            style={{
              fontSize: 13,
              color: "#000",
              fontWeight: "bold",
            }}
          >
            NICE!
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#737373",
              fontWeight: "500",
            }}
          >
            Nothing is scheduled for tomorrow..
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={() => navigation.navigate("Add")}
        style={styles.button}
      >
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  ) : (
    <View style={styles.container}>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <Image
          source={require("../assets/nothing.png")}
          style={{
            width: 200,
            height: 200,
            marginBottom: 20,
            resizeMode: "contain",
          }}
        />
        <Text
          style={{
            fontSize: 13,
            color: "#000",
            fontWeight: "bold",
          }}
        >
          Nice!
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#737373",
            fontWeight: "500",
          }}
        >
          Nothing is scheduled.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 15,
  },
  pic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#000",
    position: "absolute",
    bottom: 50,
    right: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  plus: {
    fontSize: 40,
    color: "#fff",
    position: "absolute",
    top: -6,
    left: 9,
  },
});
