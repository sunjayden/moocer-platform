import React, { Component } from "react";
import { Container, Row, Col, Pagination, Form, Button } from "react-bootstrap"
import { GoSearch } from "react-icons/go";
import Select from 'react-select';
import queryString from "query-string";

import Nav from "../header/navigation";
import CatalogItem from "./catalog-item";
import { VerifyToken } from "../utils/auth"
import { config } from '../../config';

import './catalog.css'

class Catalog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: "",
      courseList: [],
      per_page: 1,
      max_page: 1,
      current_page: 0,
      selectedCourseOption: null,
      selectedPlatformOption: null,
    };
  }

  componentDidMount() {
    if (!VerifyToken()) {
      return this.props.history.push("/");
    }
    this.loadPage();
  }

  renderPagination() {
    let active = this.state.current_page;
    let items = [];
    let start_index = active;
    let end_index = active + 1;
    if (active > 1) {
      items.push(
        <Pagination.Prev
          key={0}
          onClick={() => this.getTablePage(this.state.current_page - 1)}
        />
      );
      items.push(
        <Pagination.Item
          key={1}
          style={{ color: "#8ea6b2" }}
          onClick={() => this.getTablePage(1)}
        >
          {1}
        </Pagination.Item>
      );
    }
    if (active - 1 === 2) {
      start_index = active - 1;
    } else if (active - 1 > 2) {
      start_index = active - 1;
      items.push(<Pagination.Ellipsis key={-2} />);
    }
    if (end_index > this.state.max_page) {
      end_index = this.state.max_page;
    }
    for (let number = start_index; number <= end_index; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === active}
          onClick={() => this.getTablePage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    if (end_index < this.state.max_page - 1) {
      items.push(<Pagination.Ellipsis key={-3} />);
    }
    if (end_index < this.state.max_page) {
      items.push(
        <Pagination.Item
          key={this.state.max_page}
          onClick={() => this.getTablePage(this.state.max_page)}
        >
          {this.state.max_page}
        </Pagination.Item>
      );
    }
    if (end_index !== this.state.max_page) {
      items.push(
        <Pagination.Next
          key={-1}
          onClick={() => this.getTablePage(this.state.current_page + 1)}
        />
      );
    }
    return <Pagination className="text-center mt-3">{items}</Pagination>;
  }

  getTablePage(pageNumber) {
    this.setState(
      {
        current_page: pageNumber,
      },
      () => { this.loadPage(); window.scrollTo(0, 0); }
    );
  }

  loadPage() {
    let url = config.API_URL + `/api/courses?page=${this.state.current_page}`;

    let searchQuery = queryString.parse(this.props.location.search)["srch-term"];
    if (searchQuery) {
      url = config.API_URL + `/api/courses/search?query=${searchQuery}&page=${this.state.current_page}`
      this.setState({ searchTerm: searchQuery })
    }

    if (this.state.selectedCourseOption) {
      let free = this.state.selectedCourseOption.value === "Free Course" ? true : false;
      url = url + "&free=" + free;
    }

    if (this.state.selectedPlatformOption) {
      let platform = this.state.selectedPlatformOption.value;
      url = url + "&platform=" + platform;
    }

    fetch(url, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        this.setState({
          courseList: data.courses,
          current_page: data.page,
          per_page: data.per_page,
          max_page: data.pages,
        });
      })
      .catch((error) => console.log(error));
  }

  renderTableData() {
    return this.state.courseList.map((course, index) => {
      return (
        <Row className="h-30 pb-2" key={index}>
          <Col>
            <CatalogItem courseDetail={course} index={index} />
          </Col>
        </Row>
      );
    });
  }

  handleCourseChange = selectedCourseOption => {
    this.setState({ selectedCourseOption });
  };

  handlePlatformChange = selectedPlatformOption => {
    this.setState({ selectedPlatformOption });
  };

  submitFilter = () => {
    this.loadPage();
  }

  render() {
    const courseOptions = [
      { value: 'Free Course', label: 'Free Course' },
      { value: 'Paid Course', label: 'Paid Course' },
    ];

    const platformOptions = [
      { value: 'Udacity', label: 'Udacity' },
      { value: 'Coursera', label: 'Coursera' }
    ];

    const { selectedCourseOption, selectedPlatformOption } = this.state;

    return (
      <>
        <Nav />
        <Container fluid className="catalog-container">
          <h1 className="catalog-title">
            Course Catalog
        </h1>
          <Row>
            <Col md={{ span: 8, offset: 2 }}>
              <Form className="search-form" role="search">
                <div className="input-group add-on">
                  <input
                    className="form-control search-input"
                    placeholder="Search"
                    name="srch-term"
                    id="srch-term"
                    type="text"
                    defaultValue={this.state.searchTerm}
                  />
                  <div className="input-group-btn">
                    <button className="btn btn-default search-button" type="submit">
                      <GoSearch />
                    </button>
                  </div>
                </div>
              </Form>
            </Col>
          </Row>

          <Container className="content">
            <Row>
              <Col md={3}>
                <h4 className="filter-title">FILTER BY</h4>
                <Select
                  className="option"
                  value={selectedPlatformOption}
                  onChange={this.handlePlatformChange}
                  options={platformOptions}
                  placeholder="PLATFORM"
                />

                <Select
                  className="option"
                  value={selectedCourseOption}
                  onChange={this.handleCourseChange}
                  options={courseOptions}
                  placeholder="COURSE TYPE"
                />

                <Button className="btn btn-default filter-button" type="submit" onClick={this.submitFilter}>
                  APPLY
              </Button>

              </Col>
              <Col md={9}>
                <Container className="course-table">
                  {this.renderTableData()}
                </Container>
                <Container className="pagination-container">
                  {this.renderPagination()}
                </Container>
              </Col>
            </Row>
          </Container>
        </Container>
      </>
    );
  }
}

export default Catalog;
