import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
}));

const TableComponent = () => {
  const classes = useStyles();

  const [userData, setUserData] = useState([]);
  const [value, setValue] = useState("");
  const [id, setId] = useState("");
  const [columnName, setColumnName] = useState("");

  useEffect(() => {
    if (userData.length == 0) {
      axios.get(`http://localhost:4000/users`).then((res) => {
        const users = res.data;
        console.log(users);
        setUserData(users);
      });
    }

    if (id.length > 0) {
      const timeoutId = setTimeout(
        () => updateUserData(value, id, columnName),
        1000
      );
      return () => clearTimeout(timeoutId);
    }
  }, [id, value, columnName]);

  /* Update Data */
  const updateUserData = (val, id, columnName) => {
    let data = {};
    data[columnName] = val;

    axios.put(`http://localhost:4000/user/${id}`, data).then((response) => {
      console.log("Response ==> ", response.data);
      setUserData(response.data);
    });
  };

  /* Storing Values */
  const handleChangeValue = (e, id, columnName, index) => {
    console.log(columnName, columnName == "move_forward", e.target.checked);
    const value =
      columnName == "move_forward" ? e.target.checked : e.target.value;
    console.log(value);
    const newState = userData.map((item, i) => {
      if (i == index) {
        return { ...item, [columnName]: value };
      }
      return item;
    });

    setValue(value);
    setId(id);
    setColumnName(columnName);
    setUserData(newState);
  };

  return (
    <div className="container-fluid">
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">Sr. No.</th>
            <th scope="col">name</th>
            <th scope="col">email</th>
            <th scope="col">appointment_date</th>
            <th scope="col">move_forward</th>
            <th scope="col">interview_transcription</th>
            <th scope="col">action_result</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((val, ind) => {
            return (
              <tr key={ind}>
                <th scope="row">{ind + 1}</th>
                <td>
                  <input
                    id="name"
                    className="form-control"
                    type="text"
                    value={val.name}
                    onChange={(e) => handleChangeValue(e, val._id, "name", ind)}
                  ></input>
                </td>
                <td>
                  <input
                    id="email"
                    className="form-control"
                    type="text"
                    value={val.email}
                    onChange={(e) =>
                      handleChangeValue(e, val._id, "email", ind)
                    }
                  ></input>
                </td>
                <td>
                  <form className={classes.container} noValidate>
                    <TextField
                      id="appointment_date"
                      type="date"
                      key={ind}
                      value={val.appointment_date}
                      className={classes.textField}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(e) =>
                        handleChangeValue(e, val._id, "appointment_date", ind)
                      }
                    />
                  </form>
                </td>
                <td>
                  <center>
                    <input
                      id="move_forward"
                      key={ind}
                      type="checkbox"
                      name={"move_forward"}
                      value={val.move_forward}
                      defaultChecked={val.move_forward}
                      onChange={(e) =>
                        handleChangeValue(e, val._id, "move_forward", ind)
                      }
                    ></input>
                  </center>
                </td>
                <td>
                  <input
                    id="interview_transcription"
                    type="text"
                    className="form-control"
                    value={val.interview_transcription}
                    onChange={(e) =>
                      handleChangeValue(
                        e,
                        val._id,
                        "interview_transcription",
                        ind
                      )
                    }
                  ></input>
                </td>
                <td>
                  <label>{val.action_result}</label>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
