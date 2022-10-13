import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
  MDBSpinner,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCardTitle,
  MDBCardText,
  MDBCardHeader,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";

export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      basicModal: false,
      toggleShow: () => {
        this.setState({ basicModal: !this.state.basicModal });
      },
      searchResults: [],
      isLoading: false,
    };
  }

  notify = (props) =>
    toast(props.message, {
      promise: "pending",
      position: "top-right",
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  // use toast promise
  handleSearch = (e) => {
    e.preventDefault();
    const search = document.getElementById("search").value;
    if (search === "") return;
    this.setState({ isLoading: true });
    fetch("/movies/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search: search }),
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({ isLoading: false });
        console.log(data.response.length);
        var results = [];
        if (data.response[0].movies.length === 0) {
          this.notify({ message: "No results found" });
        } else {
          this.setState({ searchResults: data.response[0].movies });
          console.log(this.state.searchResults);
          for (let i = 0; i < data.response.length; i++) {
            for (let j = 0; j < data.response[i].movies.length; j++) {
              results.push(data.response[i].movies[j]);
            }
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    return (
      <>
        {/* <ToastContainer /> */}
        <ToastContainer />

        <MDBBtn
          onClick={this.state.toggleShow}
          outline
          className="mx-2"
          color="info"
        >
          <i className="fas fa-search" />
        </MDBBtn>
        {/* setShow={this.state.basicModal} */}

        <MDBModal show={this.state.basicModal} tabIndex="-1" staticBackdrop>
          <MDBModalDialog>
            <MDBModalContent>
              <MDBModalHeader>
                <MDBModalTitle>
                  <MDBRow>
                    <MDBCol>
                        <h5>Search</h5>
                    </MDBCol>
                    <MDBCol  className="text-center">
                      <form>
                        <input
                          type="search"
                          className="form-control"
                          placeholder="Search"
                          aria-label="Search"
                          id="search"
                          onClick={this.handleSearch}
                          style={{ width: "100%" }}
                        />
                      </form>
                    </MDBCol>
                  </MDBRow>
                </MDBModalTitle>
                <MDBBtn
                  className="btn-close"
                  color="none"
                  onClick={this.state.toggleShow}
                ></MDBBtn>
              </MDBModalHeader>
              <MDBModalBody style={{ maxHeight: "500px", overflow: "auto" }}>
                {/*  input form for search */}

                {/* search spinner */}
                {this.state.isLoading ? (
                  <div className="text-center h-gap">
                    <MDBSpinner role="status">
                      <span className="visually-hidden">Loading...</span>
                    </MDBSpinner>
                  </div>
                ) : (
                  <div></div>
                )}
                {/* search results */}

                {this.state.searchResults.map((movie) => (
                  <MDBRow>
                    <MDBCol>
                      <MDBCard
                        key={movie.id}
                        style={{ maxWidth: "15rem", margin: "0 auto" }}
                      >
                        <MDBCardHeader>
                          <MDBCardTitle>{movie.title}</MDBCardTitle>
                        </MDBCardHeader>
                        <div
                          className="bg-image hover-overlay ripple shadow-1-strong rounded"
                          data-mdb-ripple-color="light"
                        >
                          <MDBCardImage
                            src={movie.images}
                            position="top"
                            alt="{movie.title}"
                            className="img-fluid"
                            height="100px"
                          />
                          <div
                            className="mask"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
                          >
                            <div className="d-flex justify-content-center align-items-center h-100">
                              <MDBCardBody>
                                <MDBCardText>{movie.description}</MDBCardText>
                              </MDBCardBody>
                            </div>
                          </div>
                        </div>
                      </MDBCard>
                    </MDBCol>
                  </MDBRow>
                ))}
              </MDBModalBody>
              <MDBModalFooter>
                <MDBBtn color="primary" onClick={this.handleSearch}>
                  Search
                </MDBBtn>
                <MDBBtn color="secondary" onClick={this.state.toggleShow}>
                  Close
                </MDBBtn>
              </MDBModalFooter>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </>
    );
  }
}
