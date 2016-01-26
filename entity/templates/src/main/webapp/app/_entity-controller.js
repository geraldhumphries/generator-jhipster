'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>Controller', function ($scope, $state<% if (fieldsContainBlob) { %>, DataUtils<% } %>, <%= entityClass %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks, pagingParams, AlertService<% } %>) {

        $scope.<%= entityInstance %>s = [];
        <%_ if (pagination != 'no') { _%>
        $scope.predicate = pagingParams.predicate;
        $scope.reverse = pagingParams.ascending;
        $scope.searchQuery = pagingParams.search;
        $scope.currentSearch = pagingParams.search;
        <%_ } _%>
        <%_ if (pagination == 'pager' || pagination == 'pagination') { _%>

        $scope.loadAll = function() {
            var onSuccess = function (data, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.totalItems = headers('X-Total-Count');
                $scope.<%= entityInstance %>s = data;
                $scope.page = pagingParams.page;
            };
            var onError = function (error) {
                AlertService.error(error.data.message);
            };
            if ($scope.currentSearch) {
                <%= entityClass %>Search.query({
                    query: $scope.currentSearch,
                    page: pagingParams.page - 1,
                    size: 20,
                    sort: [$scope.predicate + ',' + ($scope.reverse ? 'asc' : 'desc'), 'id']
                }, onSuccess, onError);
            } else {
                <%= entityClass %>.query({
                    page: pagingParams.page - 1,
                    size: 20,
                    sort: [$scope.predicate + ',' + ($scope.reverse ? 'asc' : 'desc'), 'id']
                }, onSuccess, onError);
            }
        };

        $scope.transition = function () {
            $state.transitionTo($state.$current, {
                page: $scope.page,
                sort: $scope.predicate + ',' + ($scope.reverse ? 'asc' : 'desc'),
                search: $scope.currentSearch
            });
        };
        <%_ } _%>
        <%_ if (pagination == 'infinite-scroll') { _%>
        $scope.page = 0;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, size: 20, sort: [$scope.predicate + ',' + ($scope.reverse ? 'asc' : 'desc'), 'id']}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                for (var i = 0; i < result.length; i++) {
                    $scope.<%= entityInstance %>s.push(result[i]);
                }
            });
        };
        $scope.reset = function() {
            $scope.page = 0;
            $scope.<%= entityInstance %>s = [];
            $scope.loadAll();
        };
        <%_ } _%>
        <%_ if (pagination == 'no') { _%>
        $scope.loadAll = function() {
            <%= entityClass %>.query(function(result) {
               $scope.<%= entityInstance %>s = result;
            });
        };
        <%_ } _%>
        <%_ if (searchEngine == 'elasticsearch') { _%>

        $scope.search = function (searchQuery) {
            $scope.links = null;
            $scope.page = 1;
            $scope.predicate = 'id';
            $scope.reverse = true;
            $scope.currentSearch = searchQuery;
            $scope.transition();
        };
        <%_ } _%>

        $scope.clear = function () {
            $scope.links = null;
            $scope.page = 1;
            $scope.predicate = 'id';
            $scope.reverse = true;
            $scope.currentSearch = null;
            $scope.transition();
        };
        <%_ if (fieldsContainBlob) { _%>

        $scope.abbreviate = DataUtils.abbreviate;

        $scope.byteSize = DataUtils.byteSize;
        <%_ } _%>

        $scope.loadAll();
    });
