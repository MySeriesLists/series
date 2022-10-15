import React, { Component } from "react";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBTypography,
  MDBIcon,
  MDBProgress,
  MDBProgressBar,
} from "mdb-react-ui-kit";

import Navbar from "./Navbar";
import withRouter from "./withRouter";
import { ToastContainer, toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#000"];

const data = [];

const data1 = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      username: this.props.params.username,
      isOwner: false,
      userData: [],
    };
  }

  notify = (props) =>
    toast(props.message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  share = () => {
    // copy url to clipboard
    navigator.clipboard.writeText(window.location.href);
    this.notify({ message: "Link Copied to Clipboard" });
  };

  // get user data
  componentDidMount() {
    fetch(`/profile/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: this.state.username }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          window.location.href = "/error/404";
        }
        this.setState({ user: data.user });
        console.log(this.state.user._id);
        const user = localStorage.getItem("user");
        if (user) {
          console.log(this.state.user._id);
          // remove quotes from user
          const id = user.replace(/['"]+/g, "");
          console.log(id);
          if (id === this.state.user._id) {
            this.setState({ isOwner: true });
            // set all user data to local storage as a json string
            localStorage.setItem("userData", JSON.stringify(data.user));
          }
        }
        this.setState({
          userData: [
            {
              name: "Total",
              total: 5,
              //value : data.user.filmography.length || 5,
            },
            {
              name: "Series",
              series: 3,
              //value : data.user.filmography.filter((item) => item.type === "series").length || 2,
            },
            {
              name: "Movies",
              movies: 2,
              //value : data.user.filmography.filter((item) => item.type === "movie").length || 3,
            },
          ],
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <>
        <ToastContainer />
        <Navbar />
        <div>
          {this.state.isOwner ? (
            <>
              <div>
                <MDBContainer className="container">
                  <MDBRow className="justify-content-center align-items-center">
                    <MDBCol>
                      <MDBCardBody className="text-center">
                        <div className="mt-3 mb-4">
                          <MDBCardImage
                            src={`https://robohash.org/${this.state.user.name}.png?set=set4`}
                            className="rounded-circle"
                            fluid
                            style={{ width: "100px", border: "2px solid #000" }}
                          />
                        </div>
                        <MDBTypography tag="h4">
                          @{this.state.user.username}
                        </MDBTypography>
                        <MDBCardText className="text-muted mb-4">
                          @Programmer <span className="mx-2">|</span>{" "}
                          <a href="#!">mdbootstrap.com</a>
                        </MDBCardText>
                        <div className="mb-4 pb-2">
                          <MDBBtn outline floating>
                            <MDBIcon fab icon="facebook" size="lg" />
                          </MDBBtn>
                          <MDBBtn outline floating className="mx-1">
                            <MDBIcon fab icon="twitter" size="lg" />
                          </MDBBtn>
                          <MDBBtn outline floating>
                            <MDBIcon fab icon="skype" size="lg" />
                          </MDBBtn>
                          <MDBBtn outline floating className="mx-1">
                            <MDBIcon
                              icon="share-alt"
                              size="lg"
                              onClick={this.share}
                            />
                          </MDBBtn>
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary btn-square-xl me-5"
                        >
                          Button <br />
                          followers
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-square-xl me-5"
                        >
                          Button <br /> Followings
                        </button>

                        {this.state.userData !== [] ? (
                          <div>
                            {/* progress bar */}

                            <MDBProgress>
                              <MDBProgressBar
                                width="15"
                                valuemin={0}
                                valuemax={100}
                              />
                              <MDBProgressBar
                                bgColor="success"
                                width="30"
                                valuemin={0}
                                valuemax={100}
                              />
                              <MDBProgressBar
                                bgColor="info"
                                width="20"
                                valuemin={0}
                                valuemax={100}
                              />
                            </MDBProgress>

                            {/* bar chart */}

                            <div
                              className="align-items-start bg-light mb-3 d-inline-flex p-2 chartjs-render-monitor  me-5 h-gap"
                              style={{ minHeight: "400px" }}
                            >
                              <BarChart
                                width={400}
                                height={400}
                                data={this.state.userData}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="movies" fill="blue" />
                                <Bar dataKey="series" fill="grey" />
                                <Bar dataKey="total" fill="yellow" />
                              </BarChart>
                            </div>
                            {/* pie chart */}

                            <div
                              className="align-items-start bg-light mb-3 d-inline-flex p-2  chartjs-render-monitor h-gap"
                              style={{ minHeight: "400px" }}
                            >
                              <PieChart width={400} height={400}>
                                <Legend
                                  layout="horizontal"
                                  verticalAlign="bottom"
                                  align="center"
                                />
                                <Pie
                                  data={data1}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={renderCustomizedLabel}
                                  innerRadius={60}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {data.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                            </div>

                            {/* line chart */}

                            <div
                              className="align-items-start bg-light mb-3 d-inline-flex p-2  chartjs-render-monitor  h-gap"
                              style={{ minHeight: "400px" }}
                            >
                              <PieChart width={400} height={400}>
                                <Legend
                                  layout="horizontal"
                                  verticalAlign="bottom"
                                  align="center"
                                />
                                <Pie
                                  data={data1}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={renderCustomizedLabel}
                                  innerRadius={60}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {data.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                            </div>
                          </div>
                        ) : (
                          <h1>Data not loaded yet...</h1>
                        )}
                      </MDBCardBody>
                    </MDBCol>
                  </MDBRow>
                </MDBContainer>
              </div>
            </>
          ) : (
            <div>
              <button className="btn btn-primary">Follow</button>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default withRouter(User);
