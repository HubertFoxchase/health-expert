# -*- coding: utf-8 -*-
#!/usr/bin/env python
#
# Copyright 2014-2015 BigML
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

"""Tree structure for the BigML local Anomaly Detector

This module defines an auxiliary Tree structure that is used in the local
Anomaly Detector to score anomalies locally or embedded into your application
without needing to send requests to BigML.io.

"""
from bigml.predicates import Predicates


class AnomalyTree(object):
    """An anomaly tree-like predictive model.

    """

    def __init__(self, tree, fields):

        self.fields = fields

        if tree['predicates'] is True:
            self.predicates = Predicates([True])
        else:
            self.predicates = Predicates(tree['predicates'])
        if 'id' in tree:
            self.id = tree['id']
            self.parent_id = parent_id
            if isinstance(ids_map, dict):
                ids_map[self.id] = self
        else:
            self.id = None

        children = []
        if 'children' in tree:
            for child in tree['children']:
                children.append(AnomalyTree(child, self.fields))
        self.children = children

    def list_fields(self, out):
        """Lists a description of the model's fields.

        """
        out.write(utf8(u'<%-32s : %s>\n' % (
            self.fields[self.objective_id]['name'],
            self.fields[self.objective_id]['optype'])))
        out.flush()

        for field in [(val['name'], val['optype']) for key, val in
                      sort_fields(self.fields)
                      if key != self.objective_id]:
            out.write(utf8(u'[%-32s : %s]\n' % (field[0], field[1])))
            out.flush()
        return self.fields

    def depth(self, input_data, path=None, depth=0):
        """Returns the depth of the node that reaches the input data instance
           when ran through the tree, and the associated set of rules.

           If a node has any children whose
           predicates are all true given the instance, then the instance will
           flow through that child.  If the node has no children or no
           children with all valid predicates, then it outputs the depth of the
           node.
        """

        if path is None:
            path = []
        # root node: if predicates are met, depth becomes 1, otherwise is 0
        if depth == 0:
            if not self.predicates.apply(input_data, self.fields):
                return depth, path
            depth += 1

        if self.children:
            for child in self.children:
                if child.predicates.apply(input_data, self.fields):
                    path.append(child.predicates.to_rule(self.fields))
                    return child.depth(input_data, path=path, depth=depth + 1) 
        return depth, path
